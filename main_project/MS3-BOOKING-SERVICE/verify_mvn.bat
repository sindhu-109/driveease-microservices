@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d "c:\Users\tripu\OneDrive\Desktop\SOA\main_project\MS3-BOOKING-SERVICE"
echo JAVA_HOME=%JAVA_HOME%
call mvnw.cmd test -q
