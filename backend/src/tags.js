const a = {
    "title": "Add Two Numbers",
    "description": "Write a program that takes two integers as input and returns their sum.",
    "difficulty": "easy",
    "tags": "array",
    "visibleTestCases": [
        {
            "input": "2 3",
            "output": "5",
            "explanation": "2 + 3 equals 5"
        },
        {
            "input": "-1 5",
            "output": "4",
            "explanation": "-1 + 5 equals 4"
        }
    ],
    "hiddenTestCases": [
        {
            "input": "10 20",
            "output": "30"
        },
        {
            "input": "100 250",
            "output": "350"
        }
    ],
    "startCode": [
        {
            "language": "C++",
            "initialCode": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    // TODO: read input and print sum\n    return 0;\n}"
        },
        {
            "language": "Java",
            "initialCode": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: read input and print sum\n    }\n}"
        },
        {
            "language": "JavaScript",
            "initialCode": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\n// TODO: parse input and print sum"
        }
    ],
    "referenceSolution": [
        {
            "language": "C++",
            "completeCode": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}"
        },
        {
            "language": "Java",
            "completeCode": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}"
        },
        {
            "language": "JavaScript",
            "completeCode": "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst [a, b] = input.split(' ').map(Number);\nconsole.log(a + b);"
        }
    ]
}
