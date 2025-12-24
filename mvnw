#!/bin/sh

set -eu

MAVEN_PROJECTBASEDIR="$(cd "$(dirname "$0")" && pwd -P)"
WRAPPER_JAR="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar"

if [ ! -f "$WRAPPER_JAR" ]; then
  echo "[ERROR] Maven Wrapper jar not found: $WRAPPER_JAR" >&2
  echo "        Please ensure \".mvn/wrapper/maven-wrapper.jar\" exists." >&2
  exit 1
fi

JAVA_EXE="java"
if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
  JAVA_EXE="$JAVA_HOME/bin/java"
fi

exec "$JAVA_EXE" \
  -classpath "$WRAPPER_JAR" \
  -Dmaven.multiModuleProjectDirectory="$MAVEN_PROJECTBASEDIR" \
  org.apache.maven.wrapper.MavenWrapperMain "$@"

