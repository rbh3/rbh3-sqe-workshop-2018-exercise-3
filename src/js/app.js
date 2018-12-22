import $ from 'jquery';
import {parseCode} from './code-analyzer';
import * as mySymbolic from './symbolicSubstitution';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        mySymbolic.initVarMap();
        mySymbolic.argsParser($('#input').val());
        $('.red').remove();
        $('.green').remove();
        $('.white').remove();
        printFunction(mySymbolic.subtitution(codeToParse,parsedCode));
    });
});

const printFunction= (lines)=> {
    const getColor=(line,indx,colorsMap)=>{
        if(line.includes('if')|| line.includes('else'))
        {
            return colorsMap[indx] ? 'green' : 'red';
        }
        return 'white';
    };
    const colorsMap=mySymbolic.getColorsMap();
    let ifIndex=0;
    for(let i=0;i<lines.length;i++){
        const line=lines[i];
        const color=getColor(line,ifIndex,colorsMap);
        if(color !='white'){
            ifIndex++;
        }
        $('#res').append($('<div>'+line+'</div>').addClass(color));
    }
};

