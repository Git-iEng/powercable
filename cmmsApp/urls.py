# In iEngApp/urls.py
from django.urls import path
from . import views

app_name = 'cmmsApp'


urlpatterns = [
     # Home
    path("", views.home, name="home"),

    # Static pages

    path("contact/", views.contact, name="contact"),
   


    # Demo form submit (POST)
    path("request-demo/", views.request_demo_view, name="request_demo"),

    # Thanks page (use ONE route + ONE name)
    path("thanks/", views.contact_thanks, name="contact_thanks"),

    # Downloads
  
    

    # Consulting block form + helper endpoints
    path("contact/submit/", views.contact_block_submit, name="contact_submit"),
        path("contact/", views.contact, name="contact"),
      # Called when user clicks "Verify email"
    path(
        "api/contact/send-email-otp/",
        views.send_email_otp,
        name="send_email_otp"
    ),

    # Called when user enters OTP and clicks "Verify OTP"
    path(
        "api/contact/verify-email-otp/",
        views.verify_email_otp,
        name="verify_email_otp"
    ),
    path("contact/phone-info/", views.phone_info, name="phone_info"),
    path("contact/country-list/", views.country_list, name="country_list"),

    # Sitemap
    path("sitemap.xml", views.sitemap, name="sitemap"),

]
