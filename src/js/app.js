import $ from 'jquery';
import {parseCode} from './code-analyzer';
import * as myParser from './myParser';
import * as cfg from './cfg';
import {subtitution,argsParser,initVarMap} from './symbolicSubstitution';
import * as flowchart from 'flowchart.js';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        initVarMap();
        argsParser($('#input').val());
        subtitution(codeToParse,parsedCode);
        myParser.parserStart(parsedCode);
        document.getElementById('diagram').innerHTML = '';
        cfg.start(parsedCode);
        draw(cfg.getCFG());
    });
});

const draw = (operators)=>{
    const diagram = flowchart.parse(operators);
    diagram.drawSVG('diagram', {
        'x': 0, 'y': 0,
        'line-width': 3, 'line-length': 50, 'text-margin': 10, 'font-size': 12, 'font-color': 'black', 'line-color': 'brown',
        'element-color': 'brown', 'fill': 'white', 'yes-text': 'True', 'no-text': 'False', 'arrow-end': 'block', 'scale': 1,
        'symbols': {
            'start': {
                'font-color': 'black', 'element-color': 'green', 'fill': 'yellow' ,'start-text': '',
            },
            'end':{
                'class': 'end-element'
            }
        },
        'flowstate' : {
            'green' : { 'fill' : 'LightGreen'}, 'white': {'fill' : 'white'}
        }
    });
};
