@ECHO OFF

IF "%1" equ "" (
  node_modules\.bin\babel-node node_modules\tape\bin\tape test\*.js
)

IF "%1" equ "coverage" (
  node_modules\.bin\babel-node node_modules\isparta\bin\isparta cover node_modules\tape\bin\tape -- .\test\*.js
)
