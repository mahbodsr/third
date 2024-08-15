import VideosMap from "@/utilities/videos-map";
import { NewMessageEvent } from "telegram/events";
import { scheduleJob } from "node-schedule";

const ONE_HOUR = 60 * 60 * 1000;
const DYNAMIC_HOURS_MS = 24 * ONE_HOUR;

const addLink = async (
  event: NewMessageEvent,
  videos: VideosMap,
  videosUrl: string
) => {
  const id = `${event.message.chatId}/${event.message.id}`;
  const [, link] = event.message.text.split("/link ");
  await event.message.markAsRead();
  const video = {
    nickName: link,
    chatId: event.chatId,
    messageId: event.message.id,
    caption: "",
    createdAt: Date.now(),
    redirect: link,
  };
  await videos.set(id, video);

  await event.message.reply({
    message: `✅ Your link has been added.\n<a href="${videosUrl}">Go to mahbodsr.ir</a>`,
    replyTo: event.message.id,
    parseMode: "html",
  });
  scheduleJob(new Date(video.createdAt + DYNAMIC_HOURS_MS), async () => {
    await videos.delete(id);
  });
};

export default addLink;
