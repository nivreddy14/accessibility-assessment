/*
 * Copyright 2022 HM Revenue & Customs
 *
 */

package uk.gov.hmrc.a11y

import uk.gov.hmrc.a11y.report.Logger

import scala.sys.process._

class ShellClient extends Logger {

  val stdout                   = new StringBuilder
  val stderr                   = new StringBuilder

  def runCommand(command: String): (StringBuilder, StringBuilder) = {
    stdout.clear()
    stderr.clear()
    command ! ProcessLogger(stdout append _, stderr append _)
    (stdout, stderr)
  }
}
