function cnfSolve(cnf)
{   var lines = cnf.split(/\r\n|\r|\n/);
    var num_vars = null, num_clauses;
    var i;
    for (i = 0; i < lines.length; i++)
    {
        var toks = lines[i].split(/\s+/);
        if (toks.length == 0)
            continue;
        if (toks[0] == '')
            toks.shift();
        if (!toks[0] || toks[0] == 'c')
            continue;
        if (toks[0] == 'p')
        {
            if (toks.length != 4 || toks[1] != 'cnf')
                return 'Line ' + i + ': CNF parse error: bad header';
            num_vars = Number(toks[2]);
            num_clauses = Number(toks[3]);
            break;
        }
        return 'Line ' + i + ': CNF parse error: unexpected token ' + toks[0];
    }

    if (num_vars == null)
        return 'Line ' + i + ': CNF parse error: missing header';

    var clauses = [];
    var clause = [];
    var redundant = false;
    i++;
    for (var j = 0; j < num_clauses && i < lines.length; i++)
    {
        var toks = lines[i].split(/\s+/);
        if (toks.length == 0)
            continue;
        if (toks[0] == '')
            toks.shift();
        if (toks[0] == 'c')
            continue;
        for (var k = 0; k < toks.length; k++)
        {
            var literal = Number(toks[k]);
            var idx = (literal < 0? -literal: literal);
            if (idx == 0 && k == toks.length-1)
            {
                if (!redundant)
                    clauses.push(clause);
                clause = [];
                redundant = false;
                j++;
                break;
            }
            if (redundant)
                continue;
            var repeat = false;
            for (var l = 0; l < clause.length; l++)
            {
                if (clause[l] == literal)
                {
                    repeat = true;
                    break;
                }
                if (clause[l] == -literal)
                {
                    redundant = true;
                    break;
                }
            }
            if (idx == 0 || idx > num_vars)
                return 'Line ' + i + ': CNF parse error: literal ' + literal +
                    ' out-of-range';
            if (!repeat)
                clause.push(literal);
        }
    }

    if (j < num_clauses)
        return 'Line ' + i + ': CNF parse error: input is truncated';

    // (2) Invoke the SAT solver:
    return satSolve(num_vars, clauses);
}