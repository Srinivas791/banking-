#!/bin/sh
# ----------------------------------------------------------------------------
# Maven Wrapper Unix Script
# ----------------------------------------------------------------------------

set -e
[ -z "$DEBUG" ] || set -x

PRG="$0"
while [ -h "$PRG" ] ; do
  ls=`ls -ld "$PRG"`
  link=`expr "$ls" : '.*-> \(.*\)$'`
  if expr "$link" : '/.*' > /dev/null; then
    PRG="$link"
  else
    PRG=`dirname "$PRG"`"/$link"
  fi
done
SAVED="`pwd`"
cd "`dirname \"$PRG\"`" >/dev/null
APP_HOME="`pwd -P`"
cd "$SAVED" >/dev/null

JAVACMD="${JAVA_HOME}/bin/java"
if [ ! -x "$JAVACMD" ] ; then
  JAVACMD=java
fi

WRAPPER_JAR="$APP_HOME/.mvn/wrapper/maven-wrapper.jar"
if [ ! -r "$WRAPPER_JAR" ]; then
    echo "Downloading maven-wrapper.jar..."
    curl -o "$WRAPPER_JAR" https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
fi

exec "$JAVACMD" -Dmaven.multiModuleProjectDirectory="$APP_HOME" -jar "$WRAPPER_JAR" "$@"
