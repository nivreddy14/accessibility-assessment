/*
 * Copyright 2022 HM Revenue & Customs
 *
 */

package uk.gov.hmrc.a11y.tools

import play.api.libs.json.{Json, Writes}

case class Violation(
                      tool: String,
                      testSuite: String,
                      path: String,
                      capturedPage: String,
                      code: String,
                      severity: String,
                      alertLevel: String,
                      description: String,
                      snippet: String,
                      helpUrl: String,
                      knownIssue: Option[String] = None,
                      furtherInformation: Option[String] = None
) {

  def addFurtherInformation(furtherInformation: Option[String]): Violation =
    this.copy(furtherInformation = furtherInformation)

  def updateAlertLevel(newAlertLevel: String): Violation =
    this.copy(alertLevel = newAlertLevel)

  def setKnownIssue(knownIssue: Option[String]): Violation =
    this.copy(knownIssue = knownIssue)
}

object Violation {
  implicit val violationWrites: Writes[Violation] = Json.writes[Violation]
}
