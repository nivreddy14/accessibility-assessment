/*
 * Copyright 2022 HM Revenue & Customs
 *
 */

package uk.gov.hmrc.a11y

import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import uk.gov.hmrc.a11y.config.TestInfo

class LostCredentialsTestInfo extends TestInfo {
  val projectRootDir: String                   = System.getProperty("user.dir")
  override val testSuiteName: String           = "lost-credentials-ui-journey-tests"
  override val capturedPagesLocation: String   = s"$projectRootDir/src/test/resources/it/$testSuiteName"
  override val jenkinsArtifactLocation: String = s"$projectRootDir/src/test/resources/it/$testSuiteName"
  override val buildUrl: String                = s"https://build.tax.service.gov.uk/job/$testSuiteName"
  override val buildNumber: Int                = 1
}

class MovementsTestInfo extends TestInfo {
  val projectRootDir: String                   = System.getProperty("user.dir")
  override val testSuiteName: String           = "movements-a11y-test-build-6"
  override val capturedPagesLocation: String   = s"$projectRootDir/src/test/resources/$testSuiteName"
  override val jenkinsArtifactLocation: String = s"$projectRootDir/src/test/resources/$testSuiteName"
  override val buildUrl: String                = s"https://build.tax.service.gov.uk/job/$testSuiteName"
  override val buildNumber: Int                = 1
}

class TAMCTestInfo extends TestInfo {
  val projectRootDir: String                   = System.getProperty("user.dir")
  override val testSuiteName: String           = "tamc-accessibility-tests-build-7"
  override val capturedPagesLocation: String   = s"$projectRootDir/src/test/resources/$testSuiteName"
  override val jenkinsArtifactLocation: String = s"$projectRootDir/src/test/resources/$testSuiteName"
  override val buildUrl: String                = s"https://build.tax.service.gov.uk/job/$testSuiteName"
  override val buildNumber: Int                = 1
}

trait BaseSpec extends AnyWordSpec with Matchers {
  val lostCredentialsTestInfo = new LostCredentialsTestInfo()
  val movementsTestInfo       = new MovementsTestInfo()
  val tamcTestInfo            = new TAMCTestInfo()

  case class TestException(message: String) extends RuntimeException(message)

}
