@ECHO OFF
SETLOCAL EnableDelayedExpansion

IF "%1" equ "" (
  CALL node_modules\.bin\babel-node node_modules\tape\bin\tape test\*.js
)

IF "%1" equ "coverage" (
  CALL node_modules\.bin\babel-node node_modules\isparta\bin\isparta cover node_modules\tape\bin\tape -- .\test\*.js
  REM TODO isparta is not respecting the exit code from tape
)

EXIT /b !ERRORLEVEL!
