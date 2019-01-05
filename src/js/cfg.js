import * as mySymbolic from './symbolicSubstitution';

let lineCount=1;
let ind=0;
let nextNode;
let whileNode;
let draw;
let dic={};
let colors=[];
let colorsInd=0;
let myTable=[];
let whileMapColor=[];
let whileMapIndex=0;

const init = ()=>{
    dic=[];
    myTable=[];
    colors= mySymbolic.getColorsMap();
    ind=0;
    colorsInd=0;
    nextNode=undefined;
    whileNode=undefined;
    whileMapColor=mySymbolic.getWhileColorsMap();
    whileMapIndex=0;
};

export const getCFG = () => draw;

const createCFG = () => {
    const getLine = (line)=>{
        let ret='('+line.index+')\n';
        line=line.lines;
        line.forEach(content=> ret+=content+'\n');
        return ret; };
    const getColor = (node)=> node.isTrue==true ? 'green' : 'white';
    let retuVal='';
    for(let i=0;i<dic.length;i++) {
        const node = dic[i];
        if (node !== undefined) {
            const c = getColor(node);
            if (node.type == 's')
                retuVal += 'kodkod' + node.index + '=>operation: ' + getLine(node) + '|' + c + '\n';
            else if (node.type == 'd')
                retuVal += 'kodkod' + node.index + '=>condition: ' + getLine(node) + '|' + c + '\n';
            else
                retuVal += 'kodkod' + node.index + '=>start: ('+node.index+')\n |' + c + '\n'; }}
    return addArcs(retuVal);
};

const addArcs = (operators) =>{
    const addType= (node,name,operators,type)=>{
        const caseTrue='kodkod'+node.index;
        operators+= node.isTrue ? name+'('+type+')->'+caseTrue+'\n' : name+'('+type+',right)->'+caseTrue+'\n';
        return operators;};
    for(let i=0;i<dic.length;i++){
        const node=dic[i];
        if (node !== undefined) {
            const name = 'kodkod' + node.index;
            if (node.type == 'd') {
                operators = addType(node.true, name, operators, 'yes');
                operators = addType(node.false, name, operators, 'no');}
            if (node.next != undefined) {
                const next = 'kodkod' + node.next.index;
                operators += name + '->' + next + '\n';}
        }}
    return operators;
};

const getNodes=(node)=>{
    const isEmptyLine=(node)=>{
        if (node!=undefined && node.lines!=undefined && node.lines.length==0 && node.type!='c')
            node=node.next;
        return node;
    };
    if (node!==undefined)
    {
        if (dic[node.index]===undefined) {
            node.next=isEmptyLine(node.next);
            node.false=isEmptyLine(node.false);
            node.true=isEmptyLine(node.true);
            dic[node.index]=node;
            getNodes(node.next);
            getNodes(node.true);
            getNodes(node.false);
        }
    }
};

export const parseAllCode = (parsedCode,current,next,isTrue,theLine) =>{
    if (theLine!=undefined)
        lineCount=theLine;
    return allCases[parsedCode.type](parsedCode,current,next,isTrue,theLine);
};

const prog = (item,current,next,isTrue) => {
    item.body.forEach(item=> parseAllCode(item,current,next,isTrue));
};


const elseIfState= (item,current,next,isTrue)=>{
    const cond=parseAllCode(item.test,current,next,isTrue);
    myTable.push({Line: lineCount, Type: 'else if statment', Name: '', Condition: cond, Value: ''});
    current.isTrue=isTrue;
    current.lines.push(cond);
    current.type='d';
    const trueIf=isIfTrue() && isTrue;
    const caseTrue=initNode([],'s',next,current.isTrue);
    current.true=caseTrue;
    const isTrueBefore=trueIf;
    parseAllCode(item.consequent,caseTrue,next,trueIf);
    handleAlt(item,next,trueIf,isTrue,current,isTrueBefore);
};

const ifState =(item,current, next,isTrue, type)=>{
    const cond=parseAllCode(item.test,current,next,isTrue);
    myTable.push({Line: lineCount, Type: type, Name:'', Condition: cond, Value:''});
    const ifTrue=isIfTrue() && isTrue;
    const node=initNode([],'d',next,isTrue);
    node.lines.push(cond);
    const theNext=initNode(undefined,'c',next,isTrue);
    current.next=node;
    const caseTrue=initNode([],'s',theNext,current.isTrue);
    node.true=caseTrue;
    parseAllCode(item.consequent,caseTrue,theNext,ifTrue);
    handleAlt(item,theNext,ifTrue,isTrue,node);
    nextNode=theNext;
};

const isIfTrue = ()=>{
    const c=colors[colorsInd];
    colorsInd++;
    return c;
};

const handleAlt = (item,next,ifTrue,isTrue,node,isTrueBefore)=>{
    if (item.alternate != null) {
        const falseNode=initNode([],undefined,undefined,undefined);
        isTrueBefore=ifTrue;
        if (!(item.alternate.type == 'ElseIfStatment')){
            falseNode.type='s';
            falseNode.next=next;
            ifTrue=isIfTrue() && isTrue;
            falseNode.isTrue=ifTrue;
        }
        else
            ifTrue= isTrue && !isTrueBefore;
        node.false=falseNode;
        parseAllCode(item.alternate,falseNode,next,ifTrue);
    }
    else {
        node.false=next;
    }
};

export const getNodeAfterAss= (current, next) =>{
    let node;
    if (!(current.next!=undefined && current.next.lines!=undefined && current.next.type!='d')) {
        node=initNode([],'s',next,undefined);
        current.next = next;
    }
    else
        node=current.next;
    return node;
};

export const assExp=(item,current,next,isTrue) =>{
    const left=parseAllCode(item.left,current,next,isTrue);
    const right= parseAllCode(item.right,current,next,isTrue);
    const obj={Line: lineCount,Type: item.type,Name: left ,Condition: '',Value: right};
    myTable.push(obj);
    lineCount++;
    let node=current;
    if (current.lines === undefined)
    {
        node=getNodeAfterAss(current,next);
    }
    node.lines.push(left+' = ' + right);
    node.isTrue=isTrue;
    return obj;
};

const expState=(item,current,next,isTrue) =>{
    parseAllCode(item.expression,current,next,isTrue);
};

export const initNode= (lines,type,next,isTrue)=> {
    const obj={lines: lines, type: type,index:ind, next: next, isTrue:isTrue};
    ind++;
    return obj;
};

const whileState=(item,current,next,isTrue) =>{
    const obj= {Line: lineCount , Type: item.type, Name: '', Condition: parseAllCode(item.test,current,next,isTrue), Value:''};
    myTable.push(obj);
    lineCount++;
    const node=initNode([],'d',next,isTrue);
    node.lines.push('while '+obj.Condition);
    current.next=node;
    next=node;
    const caseTrue=initNode([],'s',next,isTrue);
    node.true=caseTrue;
    var isWhileTrue=whileMapColor[whileMapIndex] && isTrue;
    whileMapIndex++;
    parseAllCode(item.body,caseTrue,next,isWhileTrue);
    whileNode=node;
    lineCount++;
};

const binaryExp= (item)=>{
    const left= parseAllCode(item.left);
    const right= parseAllCode(item.right);
    const expression= '('+left+' '+item.operator+' '+right+')';
    return expression;
};

const fundecl= (item,current,next,isTrue)=>{
    myTable.push({Line: lineCount , Type: item.type, Name: parseAllCode(item.id,current,next,isTrue), Condition:'' , Value:''});
    item.params.forEach((param)=> myTable.push({Line: lineCount , Type:'Variable Declaration', Name: param.name, Condition:'' , Value:''}) );
    lineCount++;
    parseAllCode(item.body,current, next,isTrue);
};

const vardecl= (item,current,next,isTrue)=>{
    item.declarations.forEach((decleration)=> {
        const decl = parseAllCode(decleration,current,next,isTrue);
        let node=current;
        if (current.lines === undefined)
        {
            node = getNodeAfterAss(current,next);
        }
        node.lines.push(decl.Name+' = ' + decl.Value);
        node.isTrue=isTrue;
        myTable.push({
            Line: lineCount,
            Type: 'Variable Declaration',
            Name: decl.Name,
            Condition: decl.Condition,
            Value: decl.Value
        });
    });
    lineCount++;
};

const vardec= (item,current,next,isTrue)=>{
    return {
        Name: parseAllCode(item.id,current,next,isTrue),
        Condition: '',
        Value: parseAllCode(item.init,current,next,isTrue)
    };
};

const initWhileNode = (next)=>{
    const node ={lines: [], type: 's', isTrue: true, index: ind, next: next};
    ind++;
    return node;
};

const block=(item,current,next,isTrue)=>{
    for (let i = 0; i < item.body.length; i++) {
        parseAllCode(item.body[i],current,next,isTrue);
        if (nextNode!=undefined) {
            current=nextNode;
            nextNode=undefined;
        }
        if (whileNode !=undefined) {
            current=whileNode;
            const node=initWhileNode(current.next);
            current.false=node;
            current=node;
            whileNode=undefined;
        }
    }
};

const returnState=(item,current,next,isTrue) =>{
    const node=initNode([],'s',next,isTrue);
    const arg=parseAllCode(item.argument);
    myTable.push({Line:lineCount, Type: 'return statement', Name: '', Condition:'', Value: arg});
    node.lines.push('return '+ arg);
    current.next=node;
    lineCount++;
};

const unaryExp=(item) =>{
    let expression='';
    expression+=item.operator;
    expression+=item.argument.value;
    return expression;
};

const allCases={
    'FunctionDeclaration': fundecl,
    'VariableDeclaration': vardecl,
    'VariableDeclarator'  : vardec,
    'ExpressionStatement': expState,
    'WhileStatement': whileState,
    'IfStatement': ifState,
    'ElseIfStatment': elseIfState,
    'UnaryExpression':unaryExp,
    'ReturnStatement': returnState,
    'BlockStatement': block,
    'Identifier': (myCase)=> {return myCase.name;},
    'MemberExpression': (myCase)=> {return parseAllCode(myCase.object) + `[${parseAllCode(myCase.property)}]`;},
    'Literal': (myCase)=> {return isNaN(myCase.value) ? '\''+myCase.value+'\'' : myCase.value ;},
    'BinaryExpression': binaryExp,
    'AssignmentExpression':assExp,
    'ArrowFunctionExpression': fundecl,
    'LogicalExpression': binaryExp,
    'Program' : prog,
};

export const start = (code)=>{
    init();
    const caseTrue=initNode([],'s',undefined,true);
    parseAllCode(code,caseTrue,undefined,true,1);
    getNodes(caseTrue);
    draw=createCFG();
    return caseTrue;
};







