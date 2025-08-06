export interface Root {
  ok: number
  data: Data
}

export interface Data {
  mapi: any[]
  cards: Card[]
  cardlistInfo: CardlistInfo
  scheme: string
  showAppTips: number
}

export interface Card {
  card_group: CardGroup[]
  card_type: number
  show_type: number
  itemid?: string
  title?: string
}

export interface CardGroup {
  actionlog?: Actionlog
  card_type: number
  pic?: string
  itemid?: string
  icon?: string
  icon_width?: number
  icon_height?: number
  desc?: string
  scheme: string
  desc_extr: any
  promotion?: Promotion
  display_arrow?: number
  show_type?: number
  title?: string
  is_show_arrow?: number
  left_tag_img?: string
  sub_title?: string
}

export interface Actionlog {
  luicode: string
  lfid: string
  uicode: string
  act_code: number
  act_type: number
  fid: string
  ext: string
}

export interface Promotion {
  monitor_url: MonitorUrl[]
}

export interface MonitorUrl {
  third_party_click: string
  third_party_show: string
  type: string
  monitor_name?: string
}

export interface CardlistInfo {
  select_id: string
  title_top: string
  show_style: number
  starttime: number
  can_shared: number
  v_p: string
  containerid: string
  page_type: string
  nick: string
  cardlist_head_cards: CardlistHeadCard[]
  enable_load_imge_scrolling: number
  page_title: string
  search_request_id: string
  load_more_threshold: number
  pagesize: number
  page_common_ext: string
  cardlist_menus: any[]
  total: number
  headbg_animation: string
  page_size: number
  page: any
}

export interface CardlistHeadCard {
  title_top?: string
  show_menu: boolean
  head_type_name: string
  head_type: number
  head_data?: HeadData
  channel_list?: ChannelList[]
}

export interface HeadData {
  cover_url: string
  show_navi_mask: boolean
  show_title: boolean
  data_type: number
  scheme: string
}

export interface ChannelList {
  actionlog: Actionlog2
  scheme: string
  containerid: string
  name: string
  default_add: number
  id: number
  must_show: number
  replaced_name?: string
}

export interface Actionlog2 {
  luicode: string
  lfid: string
  uicode: string
  act_code: number
  act_type: number
  fid: string
  ext: string
}

export default defineSource(async () => {
  const url = "https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot"
  const res: Root = await myFetch(url)
  return res.data.cards[0].card_group
    .filter((k, i) => i !== 0 && k.desc && !k.actionlog?.ext.includes("ads_word"))
    .map((k) => {
      return {
        id: k.desc!,
        title: k.desc!,
        extra: {
          icon: k.icon && {
            url: proxyPicture(k.icon),
            scale: 1.5,
          },
        },
        url: `https://s.weibo.com/weibo?q=${encodeURIComponent(`#${k.desc}#`)}`,
        mobileUrl: k.scheme,
      }
    })
})
