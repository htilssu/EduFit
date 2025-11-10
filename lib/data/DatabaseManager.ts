import { prisma } from "@/lib/prisma";
import { error, info } from "@/lib/utils/logging";
import { WeekResponse } from "../types";
import { ClassExtractData } from "@/lib/utils/data";

export class DatabaseManager {
  // Lưu danh sách kỳ học
  async saveTerms(terms: string[]) {
    for (const term of terms) {
      const existingTerm = await prisma.semester.findUnique({
        where: { semester: term },
      });
      if (!existingTerm) {
        await prisma.semester.create({ data: { semester: term } });
      }
    }
  }

  // Lưu danh sách năm học
  async saveYearStudies(years: string[]) {
    for (const year of years) {
      try {
        await prisma.yearStudy.create({ data: { year } });
        info("Lưu năm học thành công: " + year);
      } catch (e) {
        error("Năm học đã tồn tại: " + year);
      }
    }
  }

  // Lưu danh sách tuần học
  async saveWeeks(
    weeks: (WeekResponse & { semester: string; yearValue: string })[],
  ) {
    for (const week of weeks) {
      try {
        await prisma.week.create({
          data: {
            weekValue: week.Week,
            weekName: week.DisPlayWeek,
            Semester: {
              connectOrCreate: {
                where: { semester: week.semester },
                create: { semester: week.semester },
              },
            },
            YearStudy: {
              connectOrCreate: {
                where: { year: week.yearValue },
                create: { year: week.yearValue },
              },
            },
          },
        });

        info("Lưu tuần học thành công: " + week.Week);
      } catch (e) {
        error("Lỗi khi lưu tuần học: " + week.Week);
      }
    }
  }

  // Lưu danh sách môn học
  async saveSubjects(subjects: any[]) {
    for (const subject of subjects) {
      try {
        await prisma.subject.create({
          data: {
            id: subject.id,
            name: subject.name,
            Major: {
              connectOrCreate: {
                where: { name: "_" },
                create: { name: "_" },
              },
            },
          },
        });

        info("Lưu môn học thành công: " + subject.name);
      } catch (e) {
        error("Môn học đã tồn tại: " + subject.name);
      }
    }
  }

  // Lưu danh sách lớp học
  async saveClasses(classes: ClassExtractData[], year: string, term: string) {
    // Lấy tất cả lecturer names từ classes
    const lecturerNames = [...new Set(classes.map((c) => c.lectureName))];

    // Tìm tất cả lecturers hiện có
    const existingLecturers = await prisma.lecturer.findMany({
      where: { name: { in: lecturerNames } },
    });

    const existingLecturerMap = new Map(
      existingLecturers.map((l) => [l.name, l]),
    );

    // Tạo lecturers mới nếu cần
    const newLecturerNames = lecturerNames.filter(
      (name) => !existingLecturerMap.has(name),
    );

    if (newLecturerNames.length > 0) {
      await prisma.lecturer.createMany({
        data: newLecturerNames.map((name) => ({ name })),
      });

      // Lấy lại lecturers vừa tạo
      const newLecturers = await prisma.lecturer.findMany({
        where: { name: { in: newLecturerNames } },
      });

      newLecturers.forEach((l) => existingLecturerMap.set(l.name, l));
    }

    // Lấy tất cả classes hiện có trong năm học và kỳ này
    const existingClasses = await prisma.class.findMany({
      where: {
        yearStudyId: year,
        semesterId: term,
      },
      include: { Lecturer: true },
    });

    const existingClassMap = new Map(
      existingClasses.map((c) => [c.classId, c]),
    );

    // Phân loại classes: tạo mới vs cập nhật
    const classesToCreate: any[] = [];
    const classesToUpdate: any[] = [];

    for (const classItem of classes) {
      const lecturer = existingLecturerMap.get(classItem.lectureName);
      if (!lecturer) continue;

      const weekDays = classItem.learningSection.map(
        (section) => section.weekDay,
      );

      const existingClass = existingClassMap.get(classItem.classId);

      if (!existingClass) {
        classesToCreate.push({
          classId: classItem.classId,
          type: classItem.type,
          learningSection: classItem.learningSection,
          subjectId: classItem.subjectId,
          yearStudyId: year,
          semesterId: term,
          lecturerId: lecturer.id,
        });
      } else if (existingClass.Lecturer.name !== classItem.lectureName) {
        classesToUpdate.push({
          id: existingClass.id,
          lecturerId: lecturer.id,
          classId: classItem.classId,
          oldLecturerName: existingClass.Lecturer.name,
          newLecturerName: classItem.lectureName,
        });
      }
    }

    // Tạo classes mới bằng createMany
    if (classesToCreate.length > 0) {
      try {
        const result = await prisma.class.createMany({
          data: classesToCreate,
        });
        info(`Lưu ${result.count} lớp học mới thành công`);
      } catch (e) {
        error("Lỗi khi lưu batch classes");
        error(e);
      }
    }

    // Cập nhật lecturer cho các classes hiện có
    if (classesToUpdate.length > 0) {
      try {
        await prisma.$transaction(
          classesToUpdate.map((c) =>
            prisma.class.update({
              where: { id: c.id },
              data: { lecturerId: c.lecturerId },
            }),
          ),
        );
        info(`Cập nhật ${classesToUpdate.length} giảng viên thành công`);
        classesToUpdate.forEach((c) => {
          info(
            `Cập nhật: ${c.classId} | ${c.oldLecturerName} --> ${c.newLecturerName}`,
          );
        });
      } catch (e) {
        error("Lỗi khi cập nhật batch lecturers");
        error(e);
      }
    }
  }
}
