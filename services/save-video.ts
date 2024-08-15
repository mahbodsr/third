import VideosMap from "@/utilities/videos-map";
import { scheduleJob } from "node-schedule";
import { Api } from "telegram";
import { NewMessageEvent } from "telegram/events";

const ONE_HOUR = 60 * 60 * 1000;
const DYNAMIC_HOURS_MS = 24 * ONE_HOUR;

const saveVideo = async (
  event: NewMessageEvent,
  videos: VideosMap,
  videosUrl: string
) => {
  const id = `${event.chatId}/${event.message.id}`;
  const [{ fileName }] = event.message.video!.attributes.filter(
    (v) => v.className === "DocumentAttributeFilename"
  ) as [Api.DocumentAttributeFilename];

  await event.message.markAsRead();
  const video = {
    nickName: fileName.replace(/\.[^/.]+$/, ""),
    chatId: event.chatId,
    messageId: event.message.id,
    caption: event.message.text,
    createdAt: Date.now(),
  };
  await videos.set(id, video);

  await event.message.reply({
    message: `✅ Your video has been added.\nTo rename video, reply video and send new name.\n<a href="${videosUrl}/${id}">Watch ${video.nickName}</a>`,
    replyTo: event.message.id,
    parseMode: "html",
  });
  scheduleJob(new Date(video.createdAt + DYNAMIC_HOURS_MS), async () => {
    await videos.delete(id);
  });
};

export default saveVideo;
