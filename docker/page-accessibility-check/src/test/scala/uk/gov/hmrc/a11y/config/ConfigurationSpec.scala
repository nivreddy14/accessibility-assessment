/*
 * Copyright 2022 HM Revenue & Customs
 *
 */

package uk.gov.hmrc.a11y.config

import com.typesafe.config.{Config, ConfigException, ConfigFactory}
import uk.gov.hmrc.a11y.BaseSpec
import uk.gov.hmrc.a11y.config.Configuration.a11yFilters

class ConfigurationSpec extends BaseSpec {

  "Configuration" should {

    "should throw an exception when furtherInformation is not defined for a filter" in {
      val a11yTestConfig: Config =
        ConfigFactory
          .load("test-application.conf")
          .getConfig("a11y-assessment-config")

      assertThrows[ConfigException.Missing] {
        a11yFilters(a11yTestConfig)
      }
    }

    "should load the a11y-filters when required filter information is defined" in {
      val filters = a11yFilters()
      assert(filters.nonEmpty, ". a11y-filters is not loaded.")
    }
  }
}
