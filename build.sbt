//mainClass in (Compile, packageBin) := Some("uk.gov.hmrc.a11y.PageAccessibilityCheck")

assemblyJarName in assembly :=  "page-accessibility-check.jar"

lazy val testSuite = (project in file("."))
  .enablePlugins(SbtAutoBuildPlugin)
  .disablePlugins(JUnitXmlReportPlugin) //Required to prevent https://github.com/scalatest/scalatest/issues/1427
  .settings(
    name := "accessibility-assessment",
    version := "0.1.0",
    scalaVersion := "2.12.12",
    scalacOptions ++= Seq("-feature"),
    target in assembly := (baseDirectory.value / "accessibility-assessment-service" / "app" / "resources"),
    libraryDependencies ++= Dependencies.compile,
    Test / unmanagedResources / excludeFilter := "*.html"
  )
