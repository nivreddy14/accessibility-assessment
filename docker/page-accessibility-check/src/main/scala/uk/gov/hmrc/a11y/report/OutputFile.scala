/*
 * Copyright 2022 HM Revenue & Customs
 *
 */

package uk.gov.hmrc.a11y.report

import java.io.FileWriter

import org.apache.commons.lang3.StringEscapeUtils.ESCAPE_JSON
import org.apache.commons.lang3.StringEscapeUtils.ESCAPE_CSV
import play.api.libs.json.{Json, OWrites}
import uk.gov.hmrc.a11y.config.TestInfo
import uk.gov.hmrc.a11y.tools.Violation

object OutputFile extends Logger {

  val currentDirectoryPath: String = System.getProperty("user.dir")

  val reportFileName   = s"accessibility-output-${System.currentTimeMillis / 1000}-json.log"
  val outputFileWriter = new FileWriter(s"$currentDirectoryPath/output/$reportFileName", true)

  //  refactor this to use writeToFile method once we understand FluentBit log setup in Build Jenkins
  def writeOutput(violationsList: List[Violation]): Unit = {
    implicit val reportWrites: OWrites[Violation] = Json.writes[Violation]
    violationsList.foreach { v =>
      outputFileWriter.write(
        s"""{"type" : "accessibility_audit", "log":"${ESCAPE_JSON.translate(Json.toJson(v).toString())}"}\n"""
      )
    }
  }

  def csvOutput(violationsList: List[Violation]): String = {

    val csvHeader: String = violationsList.headOption match {
      case Some(violation) => violation.getClass.getDeclaredFields.map(_.getName).toList.mkString(",") + "\n"
      case None            => "No accessibility violations reported"
    }

    val contents: String = violationsList.map { violation =>
      violation.productIterator.to.toList
        .map {
          case Some(value) => ESCAPE_CSV.translate(value.toString)
          case None        => ""
          case value       => ESCAPE_CSV.translate(value.toString)
        }
        .mkString(",") + "\n"
    }.mkString
    csvHeader + contents
  }

  def writeToFile(location: String, contents: String): Unit = {
    val writer = new FileWriter(s"$location", false)
    writer.write(contents)
    writer.close()
  }

  def closeFileWriter(): Unit =
    outputFileWriter.close()

  def jsonOutput(testInfo: TestInfo, violations: List[Violation]): String =
    new JsonReport().generate(testInfo, violations)
}
