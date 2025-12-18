import dayjs from "dayjs/esm"
import { myFetch } from "#/utils/fetch"
import { defineSource } from "#/utils/source"

interface WapResp {
  data: {
    card: {
      id: string
      type: string
      params: any
      children_list: {
        list: { cards: CardRes[] }
      }
      report_infos: any
      operations: any
      flip_infos: any
      static_conf: any
      info_map: any
      mix_data: any
      data_type: number
      data_style_type: number
      data: any
    }
    has_next_page: boolean
    page_context: any
    has_pre_page: boolean
    pre_page_context: any
  }
  ret: number
  msg: string
}

interface CardRes {
  id: string
  type: string
  params: CardParams
  children_list: any
  report_infos: any
  operations: any
  flip_infos: any
  static_conf: any
  info_map: any
  mix_data: any
  data_type: number
  data_style_type: number
  data: any
}

interface CardParams {
  "attent_key": string
  "card_render@item_idx": string
  "card_render@item_idx_max": string
  "card_render@item_source_type": string
  "card_render@item_type": string
  "cid": string
  "comic_main_type_name"?: string
  "cover_checkup_grade"?: string
  "episode_updated"?: string
  "cut_end_time": string
  "cut_start_time": string
  "cut_vid": string
  "image_url": string
  "item_datakey_info": string
  "item_report": string
  "item_score": string
  "positive_content_id": string
  "rank_num": string
  "rec_normal_reason": string
  "rec_subtitle": string
  "recall_alg": string
  "recall_item_type": string
  "publish_date"?: string
  "second_title"?: string
  "sub_title": string
  "title": string
  "topic_color": string
  "topic_label": string
  "type": string
  "uni_imgtag": string
}

/**
 * 腾讯视频-动漫-今日更新
 */
const qqCartoon = defineSource(async () => {
  const url
        = "https://pbaccess.video.qq.com/trpc.vector_layout.page_view.PageService/getCard?video_appid=3000010&vversion_platform=2"
  const resp: WapResp = await myFetch<WapResp>(url, {
    method: "POST",
    headers: { Referer: "https://v.qq.com/" },
    body: {
      page_params: {
        page_id: "100119",
        page_type: "channel",
        new_mark_label_enabled: "1",
        un_mod_id: "d4afd_17f79",
        un_module_key: "",
        week: dayjs().format("YYYYMMDD"),
      },
      page_context: {
        _ctrl_page_index: "2",
        _ctrl_showed_module_num: "16",
        _ds_cli_dda74ab4489e91f2__ctrl_page_index: "1",
        _ds_cli_dda74ab4489e91f2__ctrl_showed_module_num: "6",
        _ds_cli_dda74ab4489e91f2__merger_mod_cnt: "6",
        _ds_cli_dda74ab4489e91f2_ad_logic_ad_count_send: "1",
        _ds_cli_dda74ab4489e91f2_ad_logic_ams_cookies:
                    "Set-Cookie: lv_play_index=96; Domain=.l.qq.com; Path=/; HttpOnly; Expires=Thu, 31 Dec 2037 16:00:00 GMT\nSet-Cookie: o_minduid=ct0rKWMbZWYT5aJ87FXp4J5QwT18cony; Domain=.l.qq.com; Path=/; HttpOnly; Expires=Thu, 31 Dec 2037 16:00:00 GMT\nSet-Cookie: appuser=699B3844A5AA4FB5; Domain=.l.qq.com; Path=/; HttpOnly; Expires=Thu, 31 Dec 2037 16:00:00 GMT\n",
        _ds_cli_dda74ab4489e91f2_ad_logic_cards_consumed: "2",
        _ds_cli_dda74ab4489e91f2_ad_logic_ctx_version: "1",
        _ds_cli_dda74ab4489e91f2_ad_logic_flush_num: "1",
        _ds_cli_dda74ab4489e91f2_ad_logic_mg_ad_count_send: "0",
        _ds_cli_dda74ab4489e91f2_ad_logic_mg_cards_consumed: "0",
        _ds_cli_dda74ab4489e91f2_ad_logic_mg_ctx_version: "1",
        _ds_cli_dda74ab4489e91f2_ad_logic_mg_flush_num: "1",
        _ds_cli_dda74ab4489e91f2_ad_logic_mg_remaining: "0",
        _ds_cli_dda74ab4489e91f2_ad_logic_remaining: "0",
        _ds_cli_dda74ab4489e91f2_enable_mvl_bypass: "1",
        _ds_cli_dda74ab4489e91f2_page_index: "1",
        _ds_cli_dda74ab4489e91f2_page_turn_info: "2",
        _ds_cli_dda74ab4489e91f2_rec_session_id: "7be23e4d4eee2078_1765874254",
        _ds_cli_dda74ab4489e91f2_roma_info_list:
                    "10489+CARD-INDEX+3608|10489+CARD-PRERANK+3608|10489+CARD-PROFILE+3608|10489+CARD-TM+3608|10026+ROUTE-RULE+3608|10489+CARD-INDEX-COLD+3608|10489+PROFILE+3608|10489+INDEX+3608|10489+CARD-RANK+3608|10489+CARD-SELECTOR+3608|10489+ACCESS+3608|10489+RANK+3608|10489+SELECTOR+3608|10489+TM+3608|10489+ENGINE+3608|10489+PRERANK+3608|10489+CACHE-RECORD+3608|10489+CACHE-REPLAY+3608|",
        _ds_cli_dda74ab4489e91f2_sdk_page_ctx: "{\"page_offset\":1,\"page_size\":5,\"used_module_num\":6}",
        _ds_cli_dda74ab4489e91f2_video_un_page_index: "1",
        _merger_mod_cnt: "16",
        ad_logic_ad_count_send: "3",
        ad_logic_ams_cookies:
                    "Set-Cookie: lv_play_index=97; Domain=.l.qq.com; Path=/; HttpOnly; Expires=Thu, 31 Dec 2037 16:00:00 GMT\nSet-Cookie: o_minduid=ct0rKWMbZWYT5aJ87FXp4J5QwT18cony; Domain=.l.qq.com; Path=/; HttpOnly; Expires=Thu, 31 Dec 2037 16:00:00 GMT\nSet-Cookie: appuser=699B3844A5AA4FB5; Domain=.l.qq.com; Path=/; HttpOnly; Expires=Thu, 31 Dec 2037 16:00:00 GMT\n",
        ad_logic_cards_consumed: "12",
        ad_logic_ctx_version: "1",
        ad_logic_flush_num: "2",
        ad_logic_mg_ad_count_send: "0",
        ad_logic_mg_cards_consumed: "0",
        ad_logic_mg_ctx_version: "1",
        ad_logic_mg_flush_num: "2",
        ad_logic_mg_remaining: "0",
        ad_logic_remaining: "0",
        enable_mvl_bypass: "1",
        page_index: "2",
        sdk_page_ctx: "{\"page_offset\":2,\"page_size\":5,\"used_module_num\":16}",
        video_un_page_index: "2",
      },
      flip_info: {
        page_strategy_id: "",
        page_module_id: "d4afd_17f79",
        module_strategy_id: {},
        sub_module_id: "",
        flip_params: {
          is_mvl: "1",
          mvl_strategy_info:
                        "{\"default_strategy_id\":\"0d22fe32d47d40ec85308d7ca246ed96\",\"default_version\":\"1775\",\"hit_page_uuid\":\"f8b45b8703bb4e65b0f12b11e6836f3c\",\"hit_tab_info\":null,\"gray_status_info\":null,\"bypass_to_un_exp_id\":\"\"}",
          page_num: "0",
        },
        relace_children_key: [],
      },
    },
  })

  return resp?.data?.card?.children_list?.list?.cards
    ?.filter(item => item.type === "poster") // type == "poster"是视频
    .map((item) => {
      const uni_imgtag = JSON.parse(item?.params?.uni_imgtag)
      // 去掉空值
      const info = [
        item?.params?.second_title,
        item?.params?.topic_label,
        uni_imgtag?.tag_2?.text,
        uni_imgtag?.tag_4?.text,
      ]
        .filter(Boolean)
        .join(" ")

      return {
        id: item?.id,
        title: item?.params?.title,
        url: getQqVideoUrl(item?.params?.cid),
        pubDate: item?.params?.publish_date ?? getTodaySlash(),
        extra: {
          info,
          hover: item?.params?.sub_title,
        },
      }
    })
})

function getQqVideoUrl(cid: string): string {
  return `https://v.qq.com/x/cover/${cid}.html`
}

function getTodaySlash(): string {
  return dayjs().format("YYYY-MM-DD")
}

export default defineSource({
  "qqvideo-cartoon-today": qqCartoon,
})
