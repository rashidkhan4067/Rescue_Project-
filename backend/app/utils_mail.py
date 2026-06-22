import logging
from flask import current_app
from flask_mail import Message

logger = logging.getLogger(__name__)

def get_base_html(subject, body_html):
    """
    Generates a high-fidelity, ultra-premium Google Account style responsive HTML email wrapper.
    Matches accounts.google.com notification aesthetics:
    - Minimalist card on light grey background
    - Thin border (#dadce0) instead of heavy shadows
    - Custom left-aligned header logo brand
    - Strict Google Sans typography layout
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
    <style>
        body {{
            font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }}
        table {{
            border-collapse: separate;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            width: 100%;
        }}
        .container {{
            max-width: 520px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #dadce0;
            overflow: hidden;
            box-sizing: border-box;
        }}
        .header {{
            padding: 32px 32px 0 32px;
            text-align: left;
        }}
        .logo-container {{
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }}
        .logo-icon {{
            color: #1a73e8;
            font-family: 'Material Icons', sans-serif;
            font-size: 24px;
            margin-right: 8px;
            display: inline-block;
            vertical-align: middle;
        }}
        .logo-text {{
            font-size: 20px;
            font-weight: 500;
            color: #202124;
            letter-spacing: -0.2px;
            font-family: 'Google Sans', 'Segoe UI', Arial, sans-serif;
        }}
        .divider {{
            height: 1px;
            background-color: #dadce0;
            width: 100%;
        }}
        .content {{
            padding: 24px 32px 40px 32px;
            color: #3c4043;
            line-height: 1.6;
            font-size: 14px;
        }}
        .content h2 {{
            font-size: 20px;
            font-weight: 400;
            color: #202124;
            margin-top: 0;
            margin-bottom: 16px;
            line-height: 1.3;
        }}
        .btn {{
            display: inline-block;
            background-color: #1a73e8;
            color: #ffffff !important;
            padding: 10px 24px;
            border-radius: 4px;
            font-weight: 500;
            text-decoration: none;
            text-align: center;
            font-size: 14px;
            margin-top: 20px;
            transition: background-color 0.15s ease;
        }}
        .alert-box {{
            background-color: #fce8e6;
            border: 1px solid #fad2cf;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
            color: #c5221f;
            text-align: left;
        }}
        .alert-title {{
            font-weight: 500;
            font-size: 13px;
            margin-bottom: 4px;
        }}
        .alert-content {{
            font-size: 13px;
            line-height: 1.5;
        }}
        .details-card {{
            border: 1px solid #dadce0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            background-color: #ffffff;
        }}
        .details-title {{
            font-size: 14px;
            font-weight: 500;
            color: #202124;
            margin-top: 0;
            margin-bottom: 14px;
            border-bottom: 1px solid #f1f3f4;
            padding-bottom: 10px;
        }}
        .detail-row {{
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
        }}
        .detail-row:last-child {{
            margin-bottom: 0;
        }}
        .detail-label {{
            font-size: 12px;
            color: #5f6368;
            width: 35%;
            font-weight: 400;
        }}
        .detail-value {{
            font-size: 13px;
            color: #202124;
            width: 65%;
            text-align: right;
            font-weight: 500;
        }}
        .footer {{
            background-color: #ffffff;
            padding: 24px 32px 40px 32px;
            text-align: left;
            color: #5f6368;
            font-size: 11px;
            border-top: 1px solid #f1f3f4;
            line-height: 1.5;
        }}
        .footer a {{
            color: #1a73e8;
            text-decoration: none;
        }}
        @media screen and (max-width: 600px) {{
            .container {{
                margin: 0;
                border-radius: 0;
                width: 100% !important;
                border: none;
            }}
            .header, .content, .footer {{
                padding-left: 24px;
                padding-right: 24px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <span style="font-size: 24px; margin-right: 8px; vertical-align: middle;">🛡️</span>
                <span class="logo-text">Rescue Account</span>
            </div>
            <div class="divider"></div>
        </div>
        <div class="content">
            {body_html}
        </div>
        <div class="footer">
            <p>You received this secure email service announcement to update you about major operations inside your Rescue Account.</p>
            <p>&copy; 2026 Rescue Project Inc. 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.</p>
            <p style="margin-top: 16px;">
                <a href="#">Help Center</a> &bull; <a href="#">Privacy Policy</a> &bull; <a href="#">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>"""

def send_welcome_email(recipient_email, username):
    """Sends a Google-grade minimalist welcome email when a user registers on the Rescue Portal."""
    from . import mail
    subject = "Welcome to Rescue: Account Active"
    body_html = f"""
    <h2>Welcome to your new Rescue Account</h2>
    <p>Hello {username},</p>
    <p>Your new account has been successfully created. Rescue coordinates state-of-the-art neural algorithms, secure local volunteer grids, and geofenced alert portals to reunite missing families globally.</p>
    
    <p>Here is what you can do with your account now:</p>
    <ul>
        <li><strong>Secure Case Log:</strong> Register detailed search cases with landmark logs, descriptions, and photograph metadata.</li>
        <li><strong>AI Scanner Synthesis:</strong> Cross-reference matching faces across regional and coordinate databases instantly.</li>
        <li><strong>Volunteer Networks:</strong> Launch emergency geofenced alerts to community volunteers inside the first critical hour.</li>
    </ul>

    <div class="details-card">
        <div class="details-title">Account Details</div>
        <div class="detail-row">
            <div class="detail-label">Username</div>
            <div class="detail-value">{username}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Email Address</div>
            <div class="detail-value">{recipient_email}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Portal Access</div>
            <div class="detail-value">✓ Active & Secure</div>
        </div>
    </div>

    <p>To finalize your volunteer preferences or log your first case, access your dashboard below:</p>
    <div style="text-align: left;">
        <a href="http://localhost:5173/login" class="btn">Get Started</a>
    </div>
    """
    
    html_content = get_base_html(subject, body_html)
    try:
        msg = Message(
            subject=subject,
            recipients=[recipient_email],
            html=html_content,
            sender=("Rescue Accounts", current_app.config.get("MAIL_USERNAME"))
        )
        mail.send(msg)
        logger.info(f"Google-style welcome email sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to dispatch welcome email: {str(e)}")
        return False

def send_magic_link_email(recipient_email, magic_link):
    """Dispatches a secure one-click sign-in coordinate link matching Google's verification format."""
    from . import mail
    subject = "Rescue verification code"
    body_html = f"""
    <h2>Use this link to sign in to your Rescue account</h2>
    <p>Hello,</p>
    <p>We received a request to access your Rescue account via magic link. Click the button below to sign in instantly. This secure authentication link is only valid for <strong>60 minutes</strong> and can only be used once.</p>
    
    <div style="text-align: left; margin: 28px 0;">
        <a href="{magic_link}" class="btn">Sign in to Rescue</a>
    </div>

    <div class="alert-box" style="background-color: #f1f3f4; border: 1px solid #dadce0; color: #3c4043;">
        <div class="alert-title" style="color: #202124;">Did you not request this?</div>
        <div class="alert-content">
            If you did not request this link, you can safely ignore this email. No password or security settings were altered on your Rescue Account.
        </div>
    </div>

    <p style="margin-top: 32px; font-size: 12px; color: #5f6368; word-break: break-all;">
        If the button above does not load, copy and paste this URL into your browser:<br>
        <a href="{magic_link}" style="color: #1a73e8;">{magic_link}</a>
    </p>
    """
    
    html_content = get_base_html(subject, body_html)
    try:
        msg = Message(
            subject=subject,
            recipients=[recipient_email],
            html=html_content,
            sender=("Rescue Accounts", current_app.config.get("MAIL_USERNAME"))
        )
        mail.send(msg)
        logger.info(f"Google-style magic link email sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to dispatch magic link: {str(e)}")
        return False

def send_login_alert_email(recipient_email, username, ip_address, user_agent):
    """Dispatches a high-security new login alert email modeled exactly after Google Account Security Alerts."""
    from . import mail
    subject = "Security alert: New sign-in to your Rescue account"
    import datetime
    login_time = datetime.datetime.now().strftime("%A, %b %d, %Y, %I:%M %p")
    
    body_html = f"""
    <h2>New sign-in to your Rescue account</h2>
    <p>Hello {username},</p>
    <p>We detected a new successful sign-in on your Rescue account.</p>
    
    <div class="details-card">
        <div class="details-title">Sign-in Details</div>
        <div class="detail-row">
            <div class="detail-label">Account</div>
            <div class="detail-value">{recipient_email}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Time</div>
            <div class="detail-value">{login_time}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">IP Address</div>
            <div class="detail-value">{ip_address}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Device Agent</div>
            <div class="detail-value" style="font-size: 11px; word-break: break-all;">{user_agent}</div>
        </div>
    </div>

    <div class="alert-box">
        <div class="alert-title">Check your activity</div>
        <div class="alert-content">
            If this was you, you can safely disregard this warning. <strong>If this was not you</strong>, someone else might have accessed your account. Access your dashboard immediately to secure your credentials and change your password.
        </div>
    </div>

    <div style="text-align: left; margin-top: 24px;">
        <a href="http://localhost:5173/login" class="btn" style="background-color: #d93025;">Check Activity</a>
    </div>
    """
    
    html_content = get_base_html(subject, body_html)
    try:
        msg = Message(
            subject=subject,
            recipients=[recipient_email],
            html=html_content,
            sender=("Rescue Security", current_app.config.get("MAIL_USERNAME"))
        )
        mail.send(msg)
        logger.info(f"Google-style login security alert email sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to dispatch security login alert: {str(e)}")
        return False

def send_sector_mobilization_email(recipient_email, sector, volunteer_name, active_cases):
    """Sends a premium geolocated ground unit mobilization email to search volunteers."""
    from . import mail
    subject = f"🚨 URGENT: Search Mobilization Dispatched to {sector}"
    
    cases_html = ""
    for c in active_cases:
        cases_html += f"""
        <div style="border-left: 3px solid #d93025; padding-left: 10px; margin-bottom: 12px; margin-top: 12px;">
            <strong style="font-size: 14px; color: #202124;">{c.name} (Age {c.age})</strong><br>
            <span style="font-size: 12px; color: #5f6368;">Last Seen: {c.area}</span><br>
            <span style="font-size: 12px; color: #5f6368;">Description: {c.description}</span>
        </div>
        """
        
    body_html = f"""
    <h2 style="color: #d93025;">🚨 EMERGENCY RESCUE MOBILIZATION</h2>
    <p>Hello {volunteer_name},</p>
    <p>This is an automated priority emergency mobilization dispatch coordinate. A critical missing person search pattern has been declared inside your registered operational zone: <strong>{sector}</strong>.</p>
    
    <div class="alert-box" style="background-color: #fce8e6; border: 1px solid #fad2cf; color: #c5221f; margin-bottom: 20px;">
        <div class="alert-title" style="font-weight: 500; font-size: 13px; margin-bottom: 4px;">Your Mobilization is Requested Immediately</div>
        <div class="alert-content" style="font-size: 13px; line-height: 1.5;">
            Please review the target profiles below, check your radio/cellular grids, coordinate drone flights, and log any landmark sightings on the digital tactical map dashboard.
        </div>
    </div>

    <div class="details-card">
        <div class="details-title">Target Operational Area</div>
        <div class="detail-row">
            <div class="detail-label">Active Sector</div>
            <div class="detail-value">{sector}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Alert Severity</div>
            <div class="detail-value" style="color: #d93025; font-weight: bold;">CRITICAL TIER 1</div>
        </div>
    </div>

    <h3 style="margin-top: 20px; font-size: 15px; color: #202124; border-bottom: 1px solid #dadce0; padding-bottom: 6px;">Target Profile Records</h3>
    {cases_html or '<p style="color:#5f6368;">No active cases registered in this sector grid yet.</p>'}

    <div style="text-align: left; margin-top: 24px;">
        <a href="http://localhost:5173/dashboard" class="btn" style="background-color: #d93025; color: #ffffff;">Access Active Radar Map</a>
    </div>
    """
    
    html_content = get_base_html(subject, body_html)
    try:
        msg = Message(
            subject=subject,
            recipients=[recipient_email],
            html=html_content,
            sender=("Rescue Emergency Dispatch", current_app.config.get("MAIL_USERNAME"))
        )
        mail.send(msg)
        logger.info(f"Mobilization email successfully sent to {recipient_email} for {sector}")
        return True
    except Exception as e:
        logger.error(f"Failed to send sector mobilization email to {recipient_email}: {str(e)}")
        return False
