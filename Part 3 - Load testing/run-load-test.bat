@echo off
REM Runs the load test without the JMeter window (the recommended way for real load)
REM and builds the HTML report in results\report.
REM
REM Uses JMETER_HOME if it's set (the JMeter folder), otherwise "jmeter" from the PATH.
REM Extra options are passed to JMeter, for example a small trial run:
REM   run-load-test.bat -Jusers=10 -Jrampup=5

if defined JMETER_HOME (
  set "JMETER=%JMETER_HOME%\bin\jmeter.bat"
) else (
  set "JMETER=jmeter"
)

REM JMeter needs the parent folder of the report to exist
if not exist results mkdir results

call "%JMETER%" -n -t homepage-load-test.jmx -l results\results.csv -e -o results\report -f %*

echo.
echo Done. Open results\report\index.html in your browser.
