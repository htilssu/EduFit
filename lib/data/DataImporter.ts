import { prisma } from "@/lib/prisma";
import { PortalScraper } from "@/lib/data/PortalScraper";
import { DataExtractor } from "@/lib/data/DataExtractor";
import { DatabaseManager } from "@/lib/data/DatabaseManager";
import { debug, info } from "@/lib/utils/logging";

export class DataImporter {
  private scraper: PortalScraper;
  private extractor: DataExtractor;
  private dbManager: DatabaseManager;

  constructor() {
    this.scraper = new PortalScraper();
    this.extractor = new DataExtractor();
    this.dbManager = new DatabaseManager();
  }

  async importData() {
    const initialHtml = await this.scraper.getInitialPage();
    const terms = this.extractor.extractTerms(initialHtml);
    const yearStudies = this.extractor.extractYearStudies(initialHtml);
    await this.dbManager.saveTerms(terms);
    await this.dbManager.saveYearStudies(yearStudies);

    const currentYear = new Date().getFullYear().toString();
    const scrapYears = yearStudies.filter((year) => year.includes(currentYear));

    for (const year of scrapYears) {
      for (const term of terms) {
        try {
          const weeksData = await this.scraper.getWeeks(year, term);
          const weeks = weeksData.map((week) => ({
            ...week,
            yearValue: year,
            semester: term,
          }));
          await this.dbManager.saveWeeks(weeks);

          const classStudents = await this.scraper.getClassStudentByTerm(
            year,
            term,
          );
          const studentClasses =
            this.extractor.handleStudentClass(classStudents);
          const weekData = weeks[3]; // Sử dụng tuần thứ 4 như trong code gốc
          for (const studentClass of studentClasses) {
            const subjectHtml = await this.scraper.getSubjectData(
              year,
              term,
              weekData.Week,
              studentClass + "03",
            );
            const subjects =
              this.extractor.extractSubjectsFromHtml(subjectHtml);
            await this.dbManager.saveSubjects(subjects);
          }
        } catch (e) {
          console.error(`Lỗi khi xử lý năm ${year} và kỳ ${term}:`, e);
        }
      }
    }

    const subjects = await prisma.subject.findMany();

    for (const year of scrapYears) {
      for (const term of terms) {
        const week = await prisma.week.findMany({
          where: {
            semesterId: term,
            yearStudyId: year,
          },
        });

        const weekTarget = week[3]; // Tuần thứ 4
        for (const subject of subjects) {
          const classHtml = await this.scraper.getClassData(
            year,
            term,
            subject.id,
            1,
            weekTarget.weekName,
          );
          const classes = this.extractor.extractClassesFromHtml(classHtml);
          await this.dbManager.saveClasses(classes, year, term);
        }
      }
    }
  }

  async importClasses(year: string, term: string) {
    const week = await prisma.week.findMany({
      where: {
        semesterId: term,
        yearStudyId: year,
      },
    });

    if (week.length === 0) {
      console.error(`Không tìm thấy tuần học cho năm ${year} và kỳ ${term}`);
      return;
    }

    const weekTarget = week[3]; // Tuần thứ 4
    info(weekTarget);
    const subjects = await prisma.subject.findMany();
    for (const subject of subjects) {
      let weekName = weekTarget.weekName;
      while (weekName - weekTarget.weekName < 10) {
        const classHtml = await this.scraper.getClassData(
          year,
          term,
          subject.id,
          1,
          weekName,
        );
        const classes = this.extractor.extractClassesFromHtml(classHtml);
        debug(classes);
        if (classes.length === 0) {
          debug(
            `Không tìm thấy lớp học cho môn ${subject.id} năm ${year} kỳ ${term} tuần ${weekName}`,
          );
          weekName++;
          continue;
        }
        await this.dbManager.saveClasses(classes, year, term);
        break;
      }
    }
  }
}
