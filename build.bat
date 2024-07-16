call mustache build.json src\mustache\index.mustache > dist\index.php
call mustache build.json src\mustache\includes\footer.mustache > dist\_includes\footer.htm
call mustache build.json src\mustache\includes\nav.mustache > dist\_includes\nav.htm
call mustache build.json src\mustache\error\400.mustache > dist\_error\400.php
call mustache build.json src\mustache\error\401.mustache > dist\_error\401.php
call mustache build.json src\mustache\error\403.mustache > dist\_error\403.php
call mustache build.json src\mustache\error\404.mustache > dist\_error\404.php
call mustache build.json src\mustache\error\500.mustache > dist\_error\500.php
call mustache build.json src\mustache\licence.mustache > src\js\_add\licence.js

call sass src\sass\styles.sass dist\assets\dist\css\styles.css --no-source-map
call sass src\sass\fonts.sass dist\assets\dist\css\fonts.css --no-source-map

call ajaxmin -CSS dist\assets\dist\css\styles.css -out dist\assets\dist\css\styles.css

call terser src\js\_add\licence.js src\js\page.js -o dist\assets\dist\js\page.js -c -m eval --module --comments
