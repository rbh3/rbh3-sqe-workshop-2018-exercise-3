import assert from 'assert';
import * as symbolic from '../src/js/symbolicSubstitution';
import * as cfg from '../src/js/cfg';
import {parseCode} from '../src/js/code-analyzer';

describe('Tests for symbolic functions', () => {
    beforeEach(()=> {
        symbolic.initVarMap();
    });

    it(' 1. check addExp', () => {
        const input= {
            type: "AssignmentExpression",
            operator: "=",
            left: {
                type: "Identifier",
                name: "x"
            }, right: {
                type: "Literal",
                value: 3,
                raw: "3"
            }
        };
        assert.deepEqual(cfg.assExp(input,{},{},true),{Line: 1,Type: 'AssignmentExpression',Name: 'x' ,Condition: '',Value: 3});
    });

    it('2. check initNode', () => {
        assert.deepEqual(cfg.initNode([],'d',{},false),{lines:[], type:'d', next: {}, isTrue: false, index: 1});
    });

    it('3. check complex if with strings and array', () => {
        const input='let w = 1;\n' +
            'function foo(x, y, z){\n' +
            ' while(x<2){\n' +
            '  let gavri=\'ravid\';\n' +
            '  let bol = true;\n' +
            '  let n;\n' +
            '  if(gavri== z[2]){\n' +
            '    return y + x * 2\n' +
            '  }else if(gavri== \'ravid\'){\n' +
            '    if(bol == false){\n' +
            '     return w + x;\n' +
            '    }else{\n' +
            '     w = 2;\n' +
            '    }\n' +
            '  }else{\n' +
            '    return true; \n' +
            '  }\n' +
            ' }\n' +
            ' y = w + 1;\n' +
            ' let a = y;\n' +
            '}';
        symbolic.argsParser('x=1,y=2,z=[0,2,\'r\']')
        assert.equal(
            symbolic.subtitution(input,parseCode(input)).length,
            15
        );
        assert.deepEqual(
            symbolic.getColorsMap(),
            [false,true,false,true,false]
        );
    });

    it('4. check nodeAfterAss special', () => {
        const current={next: {type:'s', lines:[]}};
        assert.deepEqual(cfg.getNodeAfterAss(current,{}),{lines:[],type:'s'});
    });

    it('5. check nodeAfterAss', () => {
        const input='function r(x) {\n' +
            '    let c = 0;\n' +
            '    if (x == 2) {\n' +
            '        x = 2;\n' +
            '        if (x == 2) {\n' +
            '            a = a;\n' +
            '        } else if (x == 1) {\n' +
            '            b = b;\n' +
            '        }\n' +
            '        let e = 1;\n' +
            '        b = f;\n' +
            '    } else {\n' +
            '        a = a\n' +
            '    }\n' +
            '    return e;\n' +
            '}';
        const parsed=parseCode(input);
        symbolic.argsParser('x=1')
        symbolic.subtitution(input,parsed)
        const nodes=cfg.start(parsed);
        assert.ifError(nodes.next.false.next.lines);
    });

    it('6. check branch', () => {
        const input='function x(){\n' +
            'x=-1;\n' +
            'x=\'ravid\'\n' +
            'if(x==\'ravid\')\n' +
            'x=-3\n' +
            'if(x==3)\n' +
            'x=x\n' +
            'return x;\n' +
            '}\n';
        const parsed=parseCode(input);
        symbolic.argsParser('')
        symbolic.subtitution(input,parsed)
        const nodes=cfg.start(parsed);
        assert.deepEqual(nodes.lines.length,2);
    });

    it('7. check unary and literal', () => {
        const input='function x(){\n' +
            'x=-1;\n' +
            'x=\'ravid\'\n' +
            'if(x==\'ravid\')\n' +
            'x=-3\n' +
            'return x;\n' +
            '}\n';
        const parsed=parseCode(input);
        symbolic.argsParser('')
        symbolic.subtitution(input,parsed)
        const nodes=cfg.start(parsed);
        assert.deepEqual(nodes.lines.length,2);
    });

    it('8. check get draw', () => {
        const input='function y(){\n' +
            'return x+2;\n' +
            '}';
        const parsed=parseCode(input);
        symbolic.argsParser('')
        symbolic.subtitution(input,parsed)
        cfg.start(parsed);
        assert.deepEqual(cfg.getCFG(),'kodkod0=>operation: (0)\n' +
            '|green\n' +
            'kodkod1=>operation: (1)\n' +
            'return (x + 2)\n' +
            '|green\n' +
            'kodkod0->kodkod1\n');
    });


    it(' 9. complexTest -Teacher example with arrays', () => {
        const input='function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if (b < z[0]) {\n' +
            '        c = c + 5;\n' +
            '    } else if (b < z[0] * 2) {\n' +
            '        c = c + x + 5;\n' +
            '    } else {\n' +
            '        c = c + z[0] + 5;\n' +
            '    }\n' +
            '    \n' +
            '    return c;\n' +
            '}\n';
        const parsed=parseCode(input);
        symbolic.argsParser('x=1,y=2,z=[3]')
        symbolic.subtitution(input,parsed)
        const nodes=cfg.start(parsed);
        assert.deepEqual(nodes.next.false.true.next.type,'c');
        assert.deepEqual(nodes.next.false.lines,['(b < (z[0] * 2))']);
        assert.deepEqual(nodes.next.true.next.index,2);
    });

    it(' 10. complexTest - if and while inside each other', () => {
        const input='function complex(x) {\n' +
            '    let stam = 0;\n' +
            '    while (x == 16) {\n' +
            '        if (x == 5) {\n' +
            '            while (x == 5) {\n' +
            '                if (x == 5) {\n' +
            '                    x = x\n' +
            '                } else if (x == 5) {\n' +
            '                    stam = stam \n' +
            '                }\n' +
            '            }\n' +
            '        } else {\n' +
            '            while (x == 16) {\n' +
            '                if (x == 5) {\n' +
            '                    x = x\n' +
            '                } else if (x == 16) {\n' +
            '                    stam = stam\n' +
            '                }\n' +
            '            }\n' +
            '        }\n' +
            '    }\n' +
            '    return 3;\n' +
            '}';
        const parsed=parseCode(input);
        symbolic.argsParser('x=16')
        symbolic.subtitution(input,parsed)
        const nodes=cfg.start(parsed);
        assert.deepEqual(nodes.lines,['stam = 0']);
        assert.deepEqual(nodes.next.true.isTrue,true);
        assert.deepEqual(nodes.next.true.next.type,'d');
    });
});



