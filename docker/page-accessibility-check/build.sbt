mainClass in (Compile, packageBin) := Some("uk.gov.hmrc.a11y.PageAccessibilityCheck")

// assemblyOutputPath in assembly := baseDirectory.value / ".." / "accessibility-assessment-service" / "app" / "resources" / "page-accessibility-check.jar"
assemblyOutputPath in assembly := baseDirectory.value / ".." / "page-accessibility-check.jar"

lazy val testSuite = (project in file("."))
  .enablePlugins(SbtAutoBuildPlugin)
  .disablePlugins(JUnitXmlReportPlugin) //Required to prevent https://github.com/scalatest/scalatest/issues/1427
  .settings(
    name := "page-accessibility-check",
    version := "0.1.0",
    scalaVersion := "2.12.12",
    scalacOptions ++= Seq("-feature"),
    libraryDependencies ++= Dependencies.test ++ Dependencies.compile,
    Test / unmanagedResources / excludeFilter := "*.html"
  )
