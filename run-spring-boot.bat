@echo off
echo =========================================================================
echo Starting Apex Global Bank - Spring Boot Core Backend
echo Architecture: Java 17+, Spring Boot 3.3.5, Spring Security, H2/MySQL
echo =========================================================================
echo.

if not "%JAVA_HOME%"=="" goto has_java
if exist "C:\Program Files\Java\jdk-26.0.2.1" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-26.0.2.1"
    goto has_java
)
if exist "C:\Program Files\Java\latest" (
    set "JAVA_HOME=C:\Program Files\Java\latest"
    goto has_java
)

:has_java
echo Using JAVA_HOME: %JAVA_HOME%
echo Starting Spring Boot Server on port 8080 (Profile: H2 in-memory)...
echo When started, open http://localhost:8080 in your browser.
echo Press Ctrl+C at any time to shut down the server.
echo.

call "%~dp0mvnw.cmd" spring-boot:run

pause
