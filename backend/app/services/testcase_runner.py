from app.services.code_runner import (
    execute_code,
)


def run_testcases(

    language,

    code,

    testcases,

):

    passed = 0

    failed = []

    for i, case in enumerate(testcases):

        execution = execute_code(

            language,

            code + "\n\n" + case["driver"],

        )

        output = execution["stdout"].strip()

        expected = str(

            case["expected"]

        ).strip()

        if output == expected:

            passed += 1

        else:

            failed.append({

                "testcase": i + 1,

                "expected": expected,

                "actual": output,

            })

    return {

        "passed": passed,

        "total": len(testcases),

        "failed": failed,

    }