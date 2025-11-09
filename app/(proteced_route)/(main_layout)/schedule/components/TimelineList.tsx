"use client";

import {
  createTimeLine,
  deleteTimeLine,
  updateTimeLine,
} from "@/lib/actions/timeline-actions";
import useUser from "@/lib/hook/useUser";
import { Button, Flex, SimpleGrid, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCalendarTime, IconPlus } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { CreateTimelineModal } from "./CreateTimelineModal";
import { DeleteTimelineModal } from "./DeleteTimelineModal";
import { EditTimelineModal } from "./EditTimelineModal";
import { TimelineCard } from "./TimelineCard";
import { TimelineEmptyState } from "./TimelineEmptyState";
import { TimelineSkeleton } from "./TimelineSkeleton";
import { Timeline } from "./types";

export function TimeLineList() {
  const router = useRouter();
  const userState = useUser();
  const { data: userData, loading: isUserLoading } = userState;
  const queryClient = useQueryClient();
  const [selectedTimeline, setSelectedTimeline] = useState<Timeline | null>(
    null,
  );
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  // Fetch timelines với useQuery
  const {
    data: timelines = [],
    isLoading,
    isError,
    error,
  } = useQuery<Timeline[], Error>({
    queryKey: ["timelines", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return [];

      const response = await fetch("/api/timeline");
      if (!response.ok) {
        if (response.status === 401) {
          // Chuyển hướng đến trang đăng nhập
          router.push("/auth");
          return [];
        }
        throw new Error("Không thể tải danh sách lịch học");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isError) {
    notifications.show({
      title: "Lỗi",
      message: error?.message || "Không thể tải danh sách lịch học",
      color: "red",
    });
    // Optionally render an error state UI here
  }

  const handleCreateTimeline = async (data: {
    name: string;
    description: string;
    year: string;
    semester: string;
  }) => {
    try {
      const result = await createTimeLine({
        name: data.name,
        description: data.description || undefined,
        classes: [],
        year: data.year,
        semester: data.semester,
      });

      if (result.success) {
        notifications.show({
          title: "Thành công",
          message: "Đã tạo lịch học mới",
          color: "green",
        });
        closeCreate();
        queryClient.invalidateQueries({ queryKey: ["timelines"] });
      } else {
        notifications.show({
          title: "Lỗi",
          message: result.error || "Không thể tạo lịch học mới",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo timeline:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể tạo lịch học mới",
        color: "red",
      });
    }
  };

  const handleEditTimeline = async (data: {
    name: string;
    description: string;
  }) => {
    if (!selectedTimeline) return;

    try {
      const result = await updateTimeLine({
        id: selectedTimeline.id,
        name: data.name,
        description: data.description || undefined,
        classes: selectedTimeline.classes
          ? JSON.parse(selectedTimeline.classes as string)
          : [],
      });

      if (result.success) {
        notifications.show({
          title: "Thành công",
          message: "Đã cập nhật lịch học",
          color: "green",
        });
        setSelectedTimeline(null);
        closeEdit();
        queryClient.invalidateQueries({ queryKey: ["timelines"] });
      } else {
        notifications.show({
          title: "Lỗi",
          message: result.error || "Không thể cập nhật lịch học",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật timeline:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể cập nhật lịch học",
        color: "red",
      });
    }
  };

  const handleDeleteTimeline = async () => {
    if (!selectedTimeline) return;

    try {
      const result = await deleteTimeLine(selectedTimeline.id);

      if (result.success) {
        notifications.show({
          title: "Thành công",
          message: "Đã xóa lịch học",
          color: "green",
        });
        setSelectedTimeline(null);
        closeDelete();
        queryClient.invalidateQueries({ queryKey: ["timelines"] });
      } else {
        notifications.show({
          title: "Lỗi",
          message: result.error || "Không thể xóa lịch học",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa timeline:", error);
      notifications.show({
        title: "Lỗi",
        message: "Không thể xóa lịch học",
        color: "red",
      });
    }
  };

  const openEditModal = (timeline: Timeline) => {
    setSelectedTimeline(timeline);
    openEdit();
  };

  const openDeleteModal = (timeline: Timeline) => {
    setSelectedTimeline(timeline);
    openDelete();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="py-10 px-10 rounded-md">
      <div className="">
        <Flex justify="space-between" align="center" mb="lg">
          <Title order={2}>
            <IconCalendarTime
              size={22}
              style={{ marginRight: 10, marginBottom: -2 }}
            />
            Lịch học của bạn
          </Title>
          {userData && (
            <Button
              leftSection={<IconPlus size={14} />}
              onClick={openCreate}
              variant="filled"
              radius="md"
              size="md"
            >
              Tạo lịch học mới
            </Button>
          )}
        </Flex>

        {isUserLoading || userData === undefined ? (
          <TimelineSkeleton />
        ) : isLoading ? (
          <TimelineSkeleton />
        ) : timelines.length === 0 ? (
          <TimelineEmptyState onOpenCreate={openCreate} />
        ) : (
          <SimpleGrid
            cols={{ base: 1, xs: 1, sm: 1, md: 3, lg: 4 }}
            spacing={{ base: "sm", sm: "sm", md: "md", lg: "lg" }}
            verticalSpacing={{ base: "sm", sm: "sm", md: "md", lg: "lg" }}
          >
            {timelines.map((timeline: Timeline) => (
              <TimelineCard
                key={timeline.id}
                timeline={timeline}
                onOpenEdit={openEditModal}
                onOpenDelete={openDeleteModal}
                formatDate={formatDate}
              />
            ))}
          </SimpleGrid>
        )}
      </div>

      <CreateTimelineModal
        opened={createOpened}
        onClose={closeCreate}
        onSubmit={handleCreateTimeline}
      />

      <EditTimelineModal
        opened={editOpened}
        onClose={closeEdit}
        timeline={selectedTimeline}
        onSubmit={handleEditTimeline}
      />

      <DeleteTimelineModal
        opened={deleteOpened}
        onClose={closeDelete}
        selectedTimeline={selectedTimeline}
        handleDelete={handleDeleteTimeline}
      />
    </div>
  );
}
