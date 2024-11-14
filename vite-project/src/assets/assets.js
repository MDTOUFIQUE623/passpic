import logo from './logo.svg'
import logo_icon from './logo_icon.svg'
import arrow_icon from './arrow_icon.svg'
import header_img from './header_img.png'
import header_img1 from './header_img1.png'
import remove_bg_icon from './remove_bg_icon.svg'
import upload_btn_icon from './upload_btn_icon.svg'
import upload_icon from './upload_icon.svg'
import download_icon from './download_icon.svg'
import image_w_bg from './image_w_bg.png'
import image_wo_bg from './image_wo_bg.png'
import facebook_icon from './facebook_icon.svg'
import google_plus_icon from './google_plus_icon.svg'
import twitter_icon from './twitter_icon.svg'
import profile_img_1 from './profile_img_1.png'
import profile_img_2 from './profile_img_2.png'
import credit_icon from './credit_icon.png'

export const assets = {
    logo,
    logo_icon,
    arrow_icon,
    header_img,
    header_img1,
    remove_bg_icon,
    upload_icon,
    download_icon,
    image_w_bg,
    image_wo_bg,
    facebook_icon,
    google_plus_icon,
    twitter_icon,
    upload_btn_icon,
    credit_icon
}

export const testimonialsData = [
    {
        id: 1,
        text: "As a professional photographer, I was skeptical about AI-powered tools, but this service exceeded my expectations. The passport photos are consistently perfect, saving me hours of manual editing. The accuracy in background removal is remarkable.",
        author: "Richard Nelson",
        image: profile_img_1,
        jobTitle: 'Professional Photographer'
    },
    {
        id: 2,
        text: "I needed passport photos for my entire family, and this tool was a lifesaver. The AI perfectly handled different hair types and lighting conditions. What impressed me most was how it maintained professional quality while being incredibly easy to use.",
        author: "Sarah Mitchell",
        image: profile_img_2,
        jobTitle: 'Travel Consultant'
    },
];

export const plans = [
    {
      id: 'Basic',
      price: 10,
      credits: 100,
      desc: 'Best for personal use.'
    },
    {
      id: 'Advanced',
      price: 50,
      credits: 500,
      desc: 'Best for business use.'
    },
    {
      id: 'Business',
      price: 250,
      credits: 5000,
      desc: 'Best for enterprise use.'
    },
  ]