import $ from 'jquery';
import {parseCode} from './code-analyzer';
import * as myParser from './myParser';
import * as cfg from './cfg';
import {getColorsMap,subtitution,argsParser,initVarMap} from './symbolicSubstitution';

let myTable;

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        initVarMap();
        argsParser($('#input').val());
        const symbolic=subtitution(codeToParse,parsedCode);
        myParser.parserStart(parsedCode);
        document.getElementById('diagram').innerHTML = '';
        printNewFunc(symbolic);
        cfg.start(parsedCode);
        draw(cfg.getCFG());
    });
});

const objectToTable= ()=> {
    clear();
    let tableHtml = '<tr class="mytr"><th class="myTh">Line #</th><th class="myTh">Type</th><th class="myTh">Name</th><th class="myTh">Condition</th><th class="myTh">Value</th></tr>';
    myTable.forEach(row => {
        if(row!==undefined)
            tableHtml += `<tr class="mytr"><td class="myTd">${row.Line}</td><td class="myTd">${row.Type}</td><td class="myTd">${row.Name}</td><td class="myTd">${row.Condition}</td><td class="myTd">${row.Value}</td></tr>}`;
    });
    return tableHtml;
};

const printNewFunc=(final)=>{
    const mapColors=getColorsMap();
    let indexIf=0;
    for (let i=0;i<final.length;i++)
    {
        const line=final[i];
        const color=getColors(line,indexIf,mapColors);
        if (color!='white') {
            indexIf++;
        }
        $('#functionAfter').append(
            $('<div>' + line + '</div>').addClass(color)
        );
    }
};

const getColors=(line,indexIf,mapColors)=>{
    if (line.includes('if')||line.includes('else'))
    {
        const color=mapColors[indexIf];
        if (color==true)
            return 'green';
        return 'red';
    }
    return 'white';
};

const draw = (operators)=>{
    const diagram = flowchart.parse(operators);
    diagram.drawSVG('diagram', {
        'x': 0, 'y': 0,
        'line-width': 3, 'line-length': 50, 'text-margin': 10, 'font-size': 14, 'font-color': 'black', 'line-color': 'black',
        'element-color': 'black', 'fill': 'white', 'yes-text': 'T', 'no-text': 'F', 'arrow-end': 'block', 'scale': 1,
        'symbols': {
            'start': {
                'font-color': 'black', 'element-color': 'green', 'fill': 'yellow' ,'start-text': '',
            },
            'end':{
                'class': 'end-element'
            }
        },
        'flowstate' : {
            'green' : { 'fill' : 'green'}, 'white': {'fill' : 'white'}
        }
    });
};

const clear= ()=>{
    $('.mytr').remove();
    $('.myTh').remove();
    $('.myTd').remove();
};
