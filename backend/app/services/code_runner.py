import subprocess
import tempfile
import os


def run_python(code: str):

    with tempfile.TemporaryDirectory() as temp:

        file_path = os.path.join(
            temp,
            "solution.py"
        )

        with open(
            file_path,
            "w",
            encoding="utf-8",
        ) as f:

            f.write(code)

        result = subprocess.run(

            ["python", file_path],

            capture_output=True,

            text=True,

            timeout=5,

        )

        return {

            "stdout": result.stdout,

            "stderr": result.stderr,

            "return_code": result.returncode,

        }
def run_java(code: str):

    with tempfile.TemporaryDirectory() as temp:

        java_file = os.path.join(
            temp,
            "Main.java"
        )

        with open(
            java_file,
            "w",
            encoding="utf-8"
        ) as f:

            f.write(code)

        compile_process = subprocess.run(

            ["javac", java_file],

            capture_output=True,

            text=True,

        )

        if compile_process.returncode != 0:

            return {

                "stdout": "",

                "stderr": compile_process.stderr,

                "return_code": 1,

            }

        run_process = subprocess.run(

            ["java", "-cp", temp, "Main"],

            capture_output=True,

            text=True,

            timeout=5,

        )

        return {

            "stdout": run_process.stdout,

            "stderr": run_process.stderr,

            "return_code": run_process.returncode,

        }
def run_java(code: str):

    with tempfile.TemporaryDirectory() as temp:

        java_file = os.path.join(
            temp,
            "Main.java"
        )

        with open(
            java_file,
            "w",
            encoding="utf-8"
        ) as f:

            f.write(code)

        compile_process = subprocess.run(

            ["javac", java_file],

            capture_output=True,

            text=True,

        )

        if compile_process.returncode != 0:

            return {

                "stdout": "",

                "stderr": compile_process.stderr,

                "return_code": 1,

            }

        run_process = subprocess.run(

            ["java", "-cp", temp, "Main"],

            capture_output=True,

            text=True,

            timeout=5,

        )

        return {

            "stdout": run_process.stdout,

            "stderr": run_process.stderr,

            "return_code": run_process.returncode,

        }
