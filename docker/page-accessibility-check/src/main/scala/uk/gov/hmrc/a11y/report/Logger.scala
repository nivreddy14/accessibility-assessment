/*
 * Copyright 2022 HM Revenue & Customs
 *
 */

package uk.gov.hmrc.a11y.report

import com.typesafe.scalalogging.LazyLogging
import org.slf4j.MDC

trait Logger extends LazyLogging {
  MDC.put("type", "accessibility_logs")
  MDC.put("app", "page-accessibility-check")
  MDC.put("testSuite", System.getProperty("test.suite.name"))
}
