import { Modal, TextInput, Textarea, Group, Button } from "@mantine/core";
import { useState, useEffect } from "react";
import { Timeline } from "./types";

interface EditTimelineModalProps {
  opened: boolean;
  onClose: () => void;
  timeline: Timeline | null;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
}

/**
 * Modal để chỉnh sửa lịch học.
 * @param opened Trạng thái mở/đóng của modal.
 * @param onClose Hàm để đóng modal.
 * @param timeline Lịch học cần chỉnh sửa.
 * @param onSubmit Hàm xử lý lưu chỉnh sửa.
 */
export function EditTimelineModal({
  opened,
  onClose,
  timeline,
  onSubmit,
}: EditTimelineModalProps) {
  const [timelineName, setTimelineName] = useState("");
  const [timelineDesc, setTimelineDesc] = useState("");

  useEffect(() => {
    if (opened && timeline) {
      setTimelineName(timeline.name);
      setTimelineDesc(timeline.description || "");
    }
  }, [opened, timeline]);

  const handleEdit = async () => {
    await onSubmit({
      name: timelineName,
      description: timelineDesc,
    });
  };
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Chỉnh sửa lịch học"
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
      <Textarea
        label="Mô tả (tùy chọn)"
        placeholder="Mô tả ngắn gọn về lịch học này"
        value={timelineDesc}
        onChange={(e) => setTimelineDesc(e.target.value)}
        mb="xl"
        radius="md"
        autosize
        minRows={3}
      />
      <Group justify="flex-end">
        <Button variant="outline" onClick={onClose} radius="md">
          Hủy
        </Button>
        <Button
          onClick={handleEdit}
          disabled={!timelineName.trim()}
          radius="md"
        >
          Lưu
        </Button>
      </Group>
    </Modal>
  );
}
