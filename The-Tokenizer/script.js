// Event listener for the Process File button
document.getElementById('processButton').addEventListener('click', function() {

    var fileInput = document.getElementById('fileInput');

    if (!fileInput.files[0]) {
        alert('Please select a file to process.');
        return;
    }

    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var content = e.target.result;
        var processedContent = removeSpacesAndComments(content);
        var tokens = tokenize(processedContent);

        displayProcessedCode(processedContent);
        displayTokens(tokens);
    };

    reader.readAsText(file);
});

// Update displayed filename when a file is selected
document.getElementById('fileInput').addEventListener('change', function(){
    var fileName = this.files[0] ? this.files[0].name : 'No file chosen';
    document.getElementById('fileName').textContent = fileName;
});

// Function to remove comments and excess spaces
function removeSpacesAndComments(code) {

    // Remove comments and preprocessor directives 
    var noComments = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*|^\s*#.*$/gm, '');

    // Replace multiple whitespace characters with a single space
    var noExtraSpaces = noComments.replace(/\s+/g, ' ').trim();
    return noExtraSpaces;
}

// Function to tokenize C++ code
function tokenize(code) {

    var tokens = [];
    var index = 0;
    var length = code.length;

    // List of C++ keywords
    var keywords = [
        'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case',
        'catch', 'char', 'char16_t', 'char32_t', 'class', 'compl', 'const', 'constexpr', 'const_cast',
        'continue', 'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum',
        'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int',
        'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or',
        'or_eq', 'private', 'protected', 'public', 'register', 'reinterpret_cast', 'return', 'short',
        'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch', 'template',
        'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union',
        'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'
    ];

    // List of C++ operators
    var operators = [
        '<<=', '>>=', '++', '--', '->*', '->', '<<', '>>', '<=', '>=', '==', '!=', '&&', '||', '*=', '/=',
        '%=', '+=', '-=', '&=', '^=', '|=', '.*', '+', '-', '*', '/', '%', '^', '&', '|', '~', '!', '=',
        '<', '>', '.', '?', ':', '#', '##', '::', '.*'
    ];

    // List of C++ delimiters
    var delimiters = [
        '(', ')', '{', '}', '[', ']', ';', ',', '.', ':'
    ];

    // Sort operators and delimiters by length in descending order
    operators.sort(function(a, b) { return b.length - a.length; });
    delimiters.sort(function(a, b) { return b.length - a.length; });

    while (index < length) {
        var char = code[index];

        // Skip whitespace
        if (/\s/.test(char)) {
            index++;
            continue;
        }

        // Try to match a keyword or identifier
        var identifierMatch = code.substring(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);

        if (identifierMatch) {
            var word = identifierMatch[0];
            var type = keywords.includes(word) ? 'Keywords' : 'Identifiers';
           
            tokens.push({
                token: word,
                type: type
            });

            index += word.length;
            continue;
        }

        // Try to match a literal (number, string, character)
        var numberMatch = code.substring(index).match(/^\d+(\.\d+)?/);

        if (numberMatch) {
            var number = numberMatch[0];

            tokens.push({
                token: number,
                type: 'Literals'
            });

            index += number.length;
            continue;
        }

        var stringMatch = code.substring(index).match(/^"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/);

        if (stringMatch) {
            var string = stringMatch[0];
            tokens.push({
                token: string,
                type: 'Literals'
            });

            index += string.length;
            continue;
        }

        // Try to match an operator
        var opMatched = false;

        for (var i = 0; i < operators.length; i++) {
            var op = operators[i];
            if (code.substr(index, op.length) === op) {
                
                tokens.push({
                    token: op,
                    type: 'Operators'
                });

                index += op.length;
                opMatched = true;
                break;
            }

        }

        if (opMatched) {
            continue;
        }

        // Try to match a delimiter
        var delimMatched = false;

        for (var i = 0; i < delimiters.length; i++) {
            var delim = delimiters[i];
            if (code.substr(index, delim.length) === delim) {
                
                tokens.push({
                    token: delim,
                    type: 'Delimiters'
                });

                index += delim.length;
                delimMatched = true;
                break;
            }

        }
        if (delimMatched) {
            continue;
        }

        // Unknown token
        tokens.push({
            token: char,
            type: 'Unknown'
        });

        index++;
    }

    return tokens;
}

// Function to display the processed code
function displayProcessedCode(code) {
    document.getElementById('processedCode').style.display = 'block';
    document.getElementById('codeOutput').textContent = code;
}

// Function to display tokens in a categorized table and show total tokens
function displayTokens(tokens) {

    document.getElementById('tokenizedCode').style.display = 'block';
    var tbody = document.getElementById('tokenizedTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Clear previous content

    var categories = {};

    tokens.forEach(function(tokenObj) {

        var category = tokenObj.type;

        if (!categories[category]) {
            categories[category] = [];
        }

        if (!categories[category].includes(tokenObj.token)) {
            categories[category].push(tokenObj.token);
        }

    });

    // Prepare table rows
    for (var category in categories) {

        var row = document.createElement('tr');

        var categoryCell = document.createElement('td');
        categoryCell.textContent = category;
        row.appendChild(categoryCell);

        var tokensCell = document.createElement('td');
        tokensCell.textContent = categories[category].join(', ');
        row.appendChild(tokensCell);

        tbody.appendChild(row);

    }

    // Display total number of tokens outside the table
    var totalTokens = tokens.length;
    document.getElementById('totalTokens').textContent = 'Total Tokens: ' + totalTokens;
}
