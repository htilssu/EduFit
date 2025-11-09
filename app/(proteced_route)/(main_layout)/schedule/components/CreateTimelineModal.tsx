import {
  Modal,
  TextInput,
  Textarea,
  Group,
  Button,
  Select,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface YearStudy {
  year: string;
  createdAt: string;
  updatedAt: string;
}

interface Semester {
  semester: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTimelineModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    year: string;
    semester: string;
  }) => Promise<void>;
}

async function fetchYearStudy(): Promise<YearStudy[]> {
  const response = await fetch("/api/studyYear");
  if (!response.ok) {
    throw new Error("Failed to fetch study years");
  }
  return response.json();
}

async function fetchSemesters(): Promise<Semester[]> {
  const response = await fetch("/api/semester");
  if (!response.ok) {
    throw new Error("Failed to fetch semesters");
  }
  return response.json();
}

/**
 * Modal để tạo lịch học mới.
 * @param opened Trạng thái mở/đóng của modal.
 * @param onClose Hàm để đóng modal.
 * @param timelineName Tên lịch học.
 * @param setTimelineName Hàm cập nhật tên lịch học.
 * @param timelineDesc Mô tả lịch học.
 * @param setTimelineDesc Hàm cập nhật mô tả.
 * @param handleCreate Hàm xử lý tạo lịch học.
 */
export function CreateTimelineModal({
  opened,
  onClose,
  onSubmit,
}: CreateTimelineModalProps) {
  const [timelineName, setTimelineName] = useState("");
  const [timelineDesc, setTimelineDesc] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const { data: yearStudyData = [], isLoading: isLoadingYears } = useQuery<YearStudy[], Error>({
    queryKey: ["yearStudy"],
    queryFn: fetchYearStudy,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: semesterData = [], isLoading: isLoadingSemesters } = useQuery<Semester[], Error>({
    queryKey: ["semester"],
    queryFn: fetchSemesters,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const yearOptions = yearStudyData.map((item) => item.year);
  const semesterOptions = semesterData.map((item) => item.semester);

  useEffect(() => {
    if (!opened) {
      setTimelineName("");
      setTimelineDesc("");
      setSelectedYear(null);
      setSelectedSemester(null);
    }
  }, [opened]);

  const handleCreate = async () => {
    if (!selectedYear || !selectedSemester) return;
    
    await onSubmit({
      name: timelineName,
      description: timelineDesc,
      year: selectedYear,
      semester: selectedSemester,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Tạo lịch học mới"
      centered
      size="md"
    >
      <TextInput
        label="Tên lịch học"
        placeholder="Nhập tên lịch học"
        value={timelineName}
        onChange={(e) => setTimelineName(e.target.value)}
        required
        mb="md"
        radius="md"
      />
      <Select
        label="Năm học"
        placeholder="Chọn năm học"
        mb="md"
        radius="md"
        data={yearOptions}
        value={selectedYear}
        onChange={setSelectedYear}
        disabled={isLoadingYears}
        searchable
        required
      />
      <Select
        label="Học kỳ"
        placeholder="Chọn học kỳ"
        mb="md"
        radius="md"
        data={semesterOptions}
        value={selectedSemester}
        onChange={setSelectedSemester}
        disabled={isLoadingSemesters}
        searchable
        required
      />
      <Textarea
        label="Mô tả (tùy chọn)"
        placeholder="Mô tả ngắn gọn về lịch học này"
        value={timelineDesc}
        onChange={(e) => setTimelineDesc(e.target.value)}
        mb="xl"
        radius="md"
      />
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose} radius="md">
          Hủy
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!timelineName.trim() || !selectedYear || !selectedSemester}
          radius="md"
        >
          Tạo
        </Button>
      </Group>
    </Modal>
  );
}
