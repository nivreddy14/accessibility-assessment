/*
 * Copyright 2022 HM Revenue & Customs
 *
 */

package uk.gov.hmrc.a11y.config

import java.io.File

import scala.io.Source
import scala.util.matching.Regex

trait TestInfo {

  val testSuiteName: String
  val capturedPagesLocation: String
  val jenkinsArtifactLocation: String
  val buildUrl: String
  val buildNumber: Int
  def capturedPagesFolders: List[String] = new File(capturedPagesLocation)
    .listFiles()
    .filter(_.isDirectory)
    .map(s"$capturedPagesLocation/" + _.getName)
    .toList

  def numberOfPagesCaptured: Int = capturedPagesFolders.length

  def savedPageUrl(capturedPageFolder: String): String =
    s"$jenkinsArtifactLocation/${new File(capturedPageFolder).getName}/index.html"

  def urlPath(capturedPageFolder: String): String = {
    val bufferedSource = Source.fromFile(s"$capturedPageFolder/data")
    val url            = bufferedSource.getLines().take(1).toList.head
    val pattern        = "http:\\/\\/localhost:[0-9]{4,5}(.*)".r
    val pattern(path)  = url
    bufferedSource.close
    path
  }

}

class A11yTestInfo extends TestInfo {
  //TODO: Replace with sys.props
  override val testSuiteName: String           = System.getProperty("test.suite.name")
  override val capturedPagesLocation: String   = System.getProperty("test.suite.file.location")
  override val jenkinsArtifactLocation: String = System.getProperty("test.suite.artefact.location")
  override val buildUrl: String                = System.getProperty("test.suite.build.url")
  val buildNumberPattern: Regex                = ".*\\/([1-9]+)\\/$".r

  val buildNumber: Int = buildUrl match {
    case buildNumberPattern(buildNumber) => buildNumber.toInt
    case _                               => 0
  }
}
