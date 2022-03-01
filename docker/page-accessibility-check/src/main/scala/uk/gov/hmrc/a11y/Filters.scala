/*
 * Copyright 2022 HM Revenue & Customs
 *
 */

package uk.gov.hmrc.a11y

import uk.gov.hmrc.a11y.config.A11yFilter
import uk.gov.hmrc.a11y.config.Configuration.a11yFilters
import uk.gov.hmrc.a11y.tools.{AlertLevel, Violation}

trait Filters {

  def applyA11yFiltersFor(violations: List[Violation]): List[Violation] =
    violations
      .filterNot(globallySuppressibleViolation)
      .map(setNewAlertLevels())
      .map(addFurtherInformation())
      .map(markKnownIssues())

  def globallySuppressibleViolation: Violation => Boolean = (violation: Violation) => {
    a11yFilters().exists(a11yFilter =>
      filterMatchingViolation(a11yFilter, violation) &&
        a11yFilter.action.filterGlobally.contains("true")
    )
  }

  def addFurtherInformation(): Violation => Violation = (violation: Violation) => {
    a11yFilters().find(a11yFilter =>
      filterMatchingViolation(a11yFilter, violation) &&
        a11yFilter.action.filterGlobally.isEmpty
    ) match {
      case Some(matchedFilter) => violation.addFurtherInformation(Some(matchedFilter.action.furtherInformation))
      case None                => violation
    }
  }

  def markKnownIssues(): Violation => Violation = (violation: Violation) => {
    a11yFilters().find(a11yFilter =>
      filterMatchingViolation(a11yFilter, violation) &&
        a11yFilter.action.filterGlobally.isEmpty &&
        a11yFilter.action.knownIssue.contains("true")
    ) match {
      case Some(matchedFilter) => violation.setKnownIssue(matchedFilter.action.knownIssue)
      case None                => violation
    }
  }

  def setNewAlertLevels(): Violation => Violation = (violation: Violation) => {
    a11yFilters().find(a11yFilter =>
      filterMatchingViolation(a11yFilter, violation) &&
        a11yFilter.action.filterGlobally.isEmpty &&
        a11yFilter.action.alertLevel.isDefined
    ) match {
      case Some(matchedFilter) =>
        violation.updateAlertLevel(AlertLevel(matchedFilter.action.alertLevel.get.toLowerCase))
      case None                => violation
    }
  }

  private def filterMatchingViolation(a11yFilter: A11yFilter, violation: Violation): Boolean =
    violation.tool == a11yFilter.tool &&
      a11yFilter.descriptionRegex.findFirstIn(violation.description).isDefined &&
      a11yFilter.snippetRegex.findFirstIn(violation.snippet).isDefined
}
