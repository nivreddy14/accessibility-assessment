/*
 * Copyright 2022 HM Revenue & Customs
 *
 */

package uk.gov.hmrc.a11y.tools

object AlertLevel {

  val alertMapping: Map[String, String] = Map(
    "info"     -> "INFO",
    "warning"  -> "WARNING",
    "minor"    -> "ERROR",
    "moderate" -> "ERROR",
    "serious"  -> "ERROR",
    "critical" -> "ERROR",
    "error"    -> "ERROR"
  )

  def apply(impactType: String): String =
    alertMapping(impactType)

}
