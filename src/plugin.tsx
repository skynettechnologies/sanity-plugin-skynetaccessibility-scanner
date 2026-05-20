// import "././assets/css/scanning-and-monitoring-app.css";

import React, {useEffect, useState} from 'react'

const AppIcon = 'https://sanity.skynettechnologies.us/assets/images/AppIcon.svg'
const diamond = 'https://sanity.skynettechnologies.us/assets/images/diamond.svg'
const hexagon = 'https://sanity.skynettechnologies.us/assets/images/hexagon.svg'
const notShared = 'https://sanity.skynettechnologies.us/assets/images/not-shared.svg'
const pentagon = 'https://sanity.skynettechnologies.us/assets/images/pentagon.svg'
const planBg = 'https://sanity.skynettechnologies.us/assets/images/plan-bg.png'
const pricingBg = 'https://sanity.skynettechnologies.us/assets/images/pricing-bg.png'
const round = 'https://sanity.skynettechnologies.us/assets/images/round.svg'
const sitemapBg = 'https://sanity.skynettechnologies.us/assets/images/sitemap-bg.png'

interface ScanDetails {
  with_remediation: with_remediation
}

interface with_remediation {
  total_fail: number
  total_success: number
  severity_counts: severity_counts
  criteria_counts: {[key: string]: any[]}
}

interface severity_counts {
  Not_Applicable: number
}

interface criteria_counts {
  A: number
  AA: number
  AAA: number
}

interface ExpiredPackage {
  package_id?: string
  subscr_interval?: string
}

interface ScanData {
  domain: string
  fav_icon: string
  url_scan_status: number
  scan_status: number
  total_selected_pages: number
  total_last_scan_pages: number
  total_pages: number
  last_url_scan: number
  total_scan_pages: number
  last_scan: string | null
  next_scan_date: string | null
  success_percentage: string | number
  scan_violation_total: string | number
  total_violations: number
  package_name: string
  package_id: string
  page_views: string
  package_price: string
  subscr_interval: string
  end_date: string
  website_id: string
  is_trial_period: string | number
  dashboard_link: string
  total_fail_sum: string
  is_expired: string | boolean
  scan_details?: ScanDetails
  expired_package?: ExpiredPackage
  final_price?: number
  activePackageId?: string
  websiteId?: string
  violation_link?: string
}

interface Plan {
  id: string
  name: string
  page_views?: number
  price?: string
  monthly_price?: string
  strick_price?: string
  strick_monthly_price?: string
  action?: string
}

const HomePage: React.FC = () => {
  const [data, setData] = useState<ScanData>({} as ScanData)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // State to track whether annual billing is active
  const [isAnnual, setIsAnnual] = useState<boolean>(false)
  const handleToggle = () => setIsAnnual((prev) => !prev)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const websiteName = window.location.hostname
        const encodedDomain = btoa(websiteName)

        // 1️⃣ Register domain
        await fetch('https://skynetaccessibilityscan.com/api/register-domain-platform', {
          method: 'POST',
          body: new URLSearchParams({
            website: encodedDomain,
            platform: 'sanity',
            is_trial_period: '1',
            name: websiteName,
            email: `no-reply@${websiteName}`,
            comapany_name: websiteName,
            package_type: '10-pages',
          }),
        })

        // 2️⃣ Get Scan Detail
        const resScan = await fetch('https://skynetaccessibilityscan.com/api/get-scan-detail', {
          method: 'POST',
          body: new URLSearchParams({website: encodedDomain}),
        })
        const scanResult = await resScan.json()

        const row = scanResult?.data?.[0] || {}
        const newData: ScanData = {
          domain: row.domain || '',
          fav_icon: row.fav_icon || '',
          url_scan_status: row.url_scan_status || 0,
          scan_status: row.scan_status || 0,
          total_selected_pages: row.total_selected_pages || 0,
          total_last_scan_pages: row.total_last_scan_pages || 0,
          total_pages: row.total_pages || 0,
          last_url_scan: row.last_url_scan || 0,
          total_scan_pages: row.total_scan_pages || 0,
          last_scan: row.last_scan || null,
          next_scan_date: row.next_scan_date || null,
          success_percentage: row.success_percentage || '0',
          scan_violation_total: row.scan_violation_total || '0',
          total_violations: row.total_violations || 0,
          package_name: row.name || '',
          package_id: row.package_id || '',
          page_views: row.page_views || '',
          package_price: row.package_price || '',
          subscr_interval: row.subscr_interval || '',
          end_date: row.end_date || '',
          website_id: row.website_id || '',
          is_trial_period: row.is_trial_period || '',
          dashboard_link: scanResult.dashboard_link || '',
          total_fail_sum: row.total_fail_sum || '',
          is_expired: row.is_expired || '',
        }

        const rowUserData = scanResult?.userData?.[0] || {};        
        var saved_user_email = rowUserData.email || null;
        var saved_user_id = rowUserData.id || null;        
        const userIdInput = document.getElementById("skynetRegUserId") as HTMLInputElement | null;
        if (userIdInput) {
          userIdInput.value = saved_user_id;
        }

        console.log(saved_user_email);
        const isNoReply = saved_user_email.toLowerCase().includes("no-reply");
        if (isNoReply) {
          const emailSection = document.getElementById("email_update_section");
          if (emailSection) {
            emailSection.style.display = "block";
          }          
        }

        // 3️⃣ Get Scan Count
        const resCount = await fetch('https://skynetaccessibilityscan.com/api/get-scan-count', {
          method: 'POST',
          body: new URLSearchParams({website: encodedDomain}),
        })
        const result1 = await resCount.json()

        const withRem = result1?.scan_details?.with_remediation || []
        const withoutRem = result1?.scan_details?.without_remediation || []
        const widgetPurchased = result1?.widget_purchased ?? false

        newData.scan_details = {
          with_remediation:
            widgetPurchased === false || widgetPurchased === 'false' || widgetPurchased == 0
              ? withoutRem
              : withRem,
        }

        // 4️⃣ Get Packages List
        const resPackages = await fetch('https://skynetaccessibilityscan.com/api/packages-list', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({website: encodedDomain}),
        })
        const decoded = await resPackages.json()

        const websiteId = newData.website_id || ''
        let activePackageId = newData.package_id || ''
        let activeInterval = newData.subscr_interval || ''
        const allowedNames = ['Small Site', 'Medium Site', 'Large Site', 'Extra Large Site']
        const todayStr = new Date().toISOString().split('T')[0]

        // Determine active/expired package
        if (decoded.current_active_package && decoded.current_active_package[websiteId]) {
          const pkg = decoded.current_active_package[websiteId]
          const endDate = pkg.end_date ? new Date(pkg.end_date).toISOString().split('T')[0] : null

          if (endDate === todayStr && decoded.expired_package_detail?.[websiteId]) {
            const expired = decoded.expired_package_detail[websiteId]
            newData.expired_package = expired
            activePackageId = expired.package_id
            activeInterval = expired.subscr_interval
          } else {
            activePackageId = pkg.package_id
            activeInterval = pkg.subscr_interval
          }
        } else if (decoded.expired_package_detail?.[websiteId]) {
          const expired = decoded.expired_package_detail[websiteId]
          newData.expired_package = expired
          activePackageId = expired.package_id
          activeInterval = expired.subscr_interval
        }

        // Final price
        const activeData = decoded.current_active_package || decoded.expired_package_detail
        if (activeData) {
          const firstKey = Object.keys(activeData)[0]
          if (firstKey) newData.final_price = activeData[firstKey]?.final_price || 0
        }

        // Build plans
        const allPlans: Plan[] = []
        for (const plan of decoded.Data || []) {
          if (allowedNames.includes(plan.name)) {
            const packageId = plan.id
            let action = 'upgrade'

            if (packageId === activePackageId) {
              const endDateStr = newData.end_date
              const endDate = endDateStr ? new Date(endDateStr) : null
              action = endDate && new Date() <= endDate ? 'cancel' : 'upgrade'
            }

            plan.action = action

            // Fetch violation link
            const linkRes = await fetch(
              'https://skynetaccessibilityscan.com/api/generate-plan-action-link',
              {
                method: 'POST',
                body: new URLSearchParams({
                  website_id: websiteId,
                  current_package_id: activePackageId,
                  action: 'violation',
                }),
              },
            )
            const linkJson = await linkRes.json()
            newData.violation_link = linkJson?.action_link || '#'

            allPlans.push(plan)
          }
        }

        newData.activePackageId = activePackageId
        newData.websiteId = websiteId

        // console.log('newData :', newData)
        setData(newData)
        setPlans(allPlans)
      } catch (err) {
        console.error('Error fetching scan data:', err)
        setError('Error fetching scan data')
      } finally {
        setLoading(false)
      }
    }

    const loadAppStyles = () => {
      const existingLink = document.querySelector("link[data-style='scanner']")
      if (existingLink) return

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = 'https://sanity.skynettechnologies.us/assets/css/scanning-and-monitoring-app.css'
      link.dataset.style = 'scanner'
      document.head.appendChild(link)
    }

    fetchData()
    // loadAppStyles()
  }, [])

  // 🔘 Upgrade/Cancel button click
  const handleUpgradeClick = (planId: string, actionType: string, interval: string) => {
    const websiteId = data.website_id
    const payload: Record<string, string> = {
      website_id: websiteId,
      current_package_id: data.package_id,
      action: actionType,
    }

    if (actionType === 'upgrade') {
      payload.package_id = planId
      payload.interval = interval
    }

    const formBody = new URLSearchParams(payload).toString()
    const newWindow = window.open('', '_blank')

    fetch('https://skynetaccessibilityscan.com/api/generate-plan-action-link', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: formBody,
    })
      .then((res) => res.json())
      .then((resp) => {
        const redirectUrl = resp.action_link || resp.url
        if (redirectUrl) {
          if (newWindow) newWindow.location.href = redirectUrl
        } else {
          newWindow?.close()
          alert('No link returned from API')
        }
      })
      .catch((err) => console.error('API Error:', err))
  }

  // 🔘 Toggle views
  const showDetails = (): void => {
    const s1 = document.getElementById('section1')
    const s2 = document.getElementById('section2')
    if (s1 && s2) {
      s1.style.display = 'none'
      s2.style.display = 'block'
    }
  }

  const goBack = (): void => {
    const s1 = document.getElementById('section1')
    const s2 = document.getElementById('section2')
    if (s1 && s2) {
      s2.style.display = 'none'
      s1.style.display = 'block'
    }
  }

  // 🔘 Derived data
  const isExpired = data.end_date && new Date(data.end_date) < new Date()

  const lastScanDate = data?.last_scan
    ? new Date(data.last_scan).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  const successPercentage = Number(data?.success_percentage ?? 0)

  let statusClass = ''
  let statusText = ''
  if (successPercentage < 50) {
    statusClass = 'not-compliant'
    statusText = 'Not Compliant'
  } else if (successPercentage < 85) {
    statusClass = 'semi-compliant'
    statusText = 'Semi Compliant'
  } else {
    statusClass = 'compliant'
    statusText = 'Compliant'
  }

  const totalScanPages = Number(data?.total_scan_pages ?? 0)
  const totalPages = Number(data?.total_pages ?? 0)
  const progressWidth = totalPages > 0 ? (totalScanPages / totalPages) * 100 : 0

  const openViolationLink = () => {
    const url = data?.violation_link ?? '#'
    window.open(url, '_blank')
  }

  /**
     * _skynetToggleEmailForm
     * Show or hide the email registration form panel (accordion toggle).
     */
    const skynetToggleEmailForm = (e) => {    
        if (e) e.preventDefault();

        const wrapper = document.getElementById('skynetEmailToggleWrapper');
        const panel   = document.getElementById('skynetEmailFormPanel');
        if (!wrapper || !panel) return;

        const isOpen = wrapper.classList.contains('skynet-form-open');
        if (isOpen) {
            panel.style.display = 'none';
            wrapper.classList.remove('skynet-form-open');
        } else {
            panel.style.display = 'block';
            wrapper.classList.add('skynet-form-open');
            // Clear previous messages on each open
            const errEl = document.getElementById('skynetEmailFormError');
            const okEl  = document.getElementById('skynetEmailFormSuccess');
            if (errEl) errEl.style.display = 'none';
            if (okEl)  okEl.style.display  = 'none';
        }
    };

    /**
     * _skynetSaveEmail
     * Validate name + email, then call registerDomain() API.
     * On success: hide the entire toggle wrapper (email is now set).
     *
     * NOTE: In production this calls the real registerDomain() function
     * which posts FormData to skynetaccessibilityscan.com.
     * In this standalone skynetscanner it calls skynetscannerRegisterEmail() instead.
     */
    const skynetSaveEmail = (e) => {       
        if (e) e.preventDefault();

        const userIdInput = document.getElementById('skynetRegUserId');
        const nameInput  = document.getElementById('skynetRegName');
        const emailInput = document.getElementById('skynetRegEmail');
        const errEl      = document.getElementById('skynetEmailFormError');
        const okEl       = document.getElementById('skynetEmailFormSuccess');
        const saveBtn    = document.getElementById('skynetRegSaveBtn');
        const saveTxt    = document.getElementById('skynetRegSaveBtnText');
        const spinner    = document.getElementById('skynetRegSaveSpinner');

        // Clear previous error state
        [nameInput, emailInput].forEach(el => el && el.classList.remove('skynet-input-error'));
        if (errEl) errEl.style.display = 'none';
        if (okEl)  okEl.style.display  = 'none';

        // ── Validate ──
        const name  = (nameInput  && nameInput.value.trim())  || '';
        const email = (emailInput && emailInput.value.trim()) || '';
        const userid = (userIdInput && userIdInput.value.trim()) || '';
        
        let hasError = false;

        if (!name) {
            nameInput && nameInput.classList.add('skynet-input-error');
            hasError = true;
        }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRe.test(email)) {
            emailInput && emailInput.classList.add('skynet-input-error');
            hasError = true;
        }
        if (hasError) {
            if (errEl) {
                errEl.textContent = 'Please enter a valid name and email address.';
                errEl.style.display = 'block';
            }
            return;
        }

        // ── Show loading state ──
        if (saveBtn) saveBtn.disabled = true;
        if (saveTxt) saveTxt.textContent = 'Saving…';
        if (spinner) spinner.style.display = 'inline-block';

        try {
            const websiteUrl = window.location.origin;
            let domain = '';
            try { domain = new URL(websiteUrl).hostname; }
            catch (_) { domain = websiteUrl.replace(/^https?:\/\//, '').split('/')[0]; }

            const userInfo = { name, email, userid };

            // In production: await registerDomain(websiteUrl, userInfo, domain);
            // In this skynetscanner:
            await skynetscannerRegisterEmail(websiteUrl, userInfo, domain);

            // ── Success ──
            if (okEl) {
                okEl.textContent = 'Email registered successfully!';
                okEl.style.display = 'block';
            }
            setTimeout(function () {
                const wrapper = document.getElementById('email_update_section');
                if (wrapper) wrapper.style.display = 'none';
            }, 1200);

        } catch (err) {
            const msg = (err && err.message) ? err.message : 'Registration failed. Please try again.';
            if (errEl) {
                errEl.textContent = msg;
                errEl.style.display = 'block';
            }
        } finally {
            if (saveBtn) saveBtn.disabled = false;
            if (saveTxt) saveTxt.textContent = 'Save';
            if (spinner) spinner.style.display = 'none';
        }
    };

    /**
     * _skynetHandleEmailToggle
     * Called after user-info fetch. Shows wrapper if email is missing/fallback.
     */
    function skynetHandleEmailToggle(userInfoResponse) {
        const wrapper = document.getElementById('skynetEmailToggleWrapper');
        if (!wrapper) return;
        const email = (userInfoResponse && userInfoResponse.email) || '';
        const isFallback = !email || email.startsWith('no-reply@');
        wrapper.style.display = isFallback ? 'block' : 'none';
    }

    /* ─────────────────────────────────────────────
       skynetscanner HELPERS — not part of the production module
    ───────────────────────────────────────────── */

    /** Simulates a 1.2 s network delay, then resolves successfully */
    function skynetscannerRegisterEmail(websiteUrl, userInfo, domain) {
        return new Promise(async (resolve, reject) => {
            
            try {
                const response = await fetch('https://skynetaccessibilityscan.com/api/update-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: userInfo.userid,
                        name: userInfo.name,
                        email: userInfo.email
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    resolve({ status: '0'}); // expected { status: '1' } or similar
                } else {
                    reject({ status: '0'});
                }
            } catch (error) {
                reject({ status: '0', error: error.message });
            }
        });
    }

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div className="loader"></div>
        <style>{`
          .loader {
            border: 6px solid #f3f3f3;
            border-top: 6px solid #3f51b5;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}</style>
      </div>
    )

  if (error) return <p>{error}</p>

  return (
    <>
      <div>
        <meta content="" name="description" />
        <link href="" rel="mask-icon" />
        <meta content="Drupal 9 (https://www.drupal.org)" name="Generator" />
        <meta content="width" name="MobileOptimized" />
        <meta content="true" name="HandheldFriendly" />
        <meta content="width=device-width, initial-scale=1, shrink-to-fit=no" name="viewport" />
        <meta content="ie=edge" httpEquiv="x-ua-compatible" />
        <link
          href="https://www.skynettechnologies.com/sites/default/files/favicon_0.webp"
          rel="icon"
          type="image/png"
        />
                
        <link
          rel="stylesheet"
          type="text/css"
          href="https://sanity.skynettechnologies.us/assets/css/scanning-and-monitoring-app.css"
        />
        {/* <link rel="stylesheet" href="././assets/css/scanning-and-monitoring-app.css"/> */}
        <div id="section1">
          <a className="visually-hidden focusable skip-link" href="#main-content"></a>
          <div className="dialog-off-canvas-main-canvas" data-off-canvas-main-canvas="">
            <div id="page-wrapper">
              <div id="page">
                <div className="layout-main-wrapper clearfix" id="main-wrapper">
                  <div className="container" id="main">
                    <div className="row row-offcanvas row-offcanvas-left clearfix">
                      <main className="main-content col" id="content" role="main">
                        <section className="section">
                          <div id="main-content" tabIndex={-1} />
                          <div
                            className="block block-system block-system-main-block"
                            id="block-skynettechnologies-content"
                          >
                            <div className="content">
                              <article
                                className="node node--type-page node--view-mode-full clearfix"
                                data-history-node-id="529"
                              >
                                <div className="node__content clearfix ">
                                  <div className="scanning-monitoring-app">
                                    <div class="skynetscanner-card" id="email_update_section"  style={{ display: "none" }}>
                                  <div id="skynetEmailToggleWrapper" style="display:block;">
                                      <div class="skynet-email-toggle-bar">
                                          <span class="skynet-email-toggle-label">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                                                  viewBox="0 0 24 24" style="vertical-align:middle;margin-right:6px;">
                                              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9
                                                        2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
                                                    fill="#420083"/>
                                            </svg>
                                            Please enter your Email for further Scanning Reports.
                                          </span>
                                          <button id="skynetEmailToggleBtn"
                                                  class="skynet-email-toggle-btn"
                                                  type="button"
                                                  onClick={() => skynetToggleEmailForm(Event)}
                                                  >
                                              <span id="skynetEmailToggleBtnText">Add Email</span>                            
                                              <svg id="skynetEmailToggleArrow"
                                                    xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                                    viewBox="0 0 24 24" fill="none"
                                                    style="margin-left:6px;transition:transform 0.25s;">
                                                  <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
                                              </svg>
                                          </button>
                                      </div>
                                      <div id="skynetEmailFormPanel" class="skynet-email-form-panel" style="display:none;">
                                          <div class="skynet-email-form-inner">

                                              <h3 class="skynet-email-form-title">Register Your Details</h3>
                                              <input type="hidden" id="skynetRegUserId" value="" />

                                              
                                              <div id="skynetEmailFormError"
                                                    class="skynet-email-form-error"
                                                    style="display:none;"></div>
                                              <div id="skynetEmailFormSuccess"
                                                    class="skynet-email-form-success"
                                                    style="display:none;"></div>

                                              <div class="skynet-email-form-row">
                                                  <label class="skynet-email-form-label" for="skynetRegName">
                                                      Full Name <span style="color:#e53e3e;">*</span>
                                                  </label>
                                                  <input id="skynetRegName"
                                                          class="skynet-email-form-input"
                                                          type="text"
                                                          placeholder="Enter your full name"
                                                          autocomplete="name" />
                                              </div>
                                              <div class="skynet-email-form-row">
                                                  <label class="skynet-email-form-label" for="skynetRegEmail">
                                                      Email Address <span style="color:#e53e3e;">*</span>
                                                  </label>
                                                  <input id="skynetRegEmail"
                                                          class="skynet-email-form-input"
                                                          type="email"
                                                          placeholder="Enter your email address"
                                                          autocomplete="email" />
                                              </div>
                                              <div class="skynet-email-form-actions">
                                                  
                                                  <button id="skynetRegSaveBtn"
                                                          class="skynet-email-save-btn"
                                                          type="button"
                                                          onClick={() => skynetSaveEmail(Event)}
                                                          >
                                                      <span id="skynetRegSaveBtnText">Save</span>
                                                      <svg id="skynetRegSaveSpinner"
                                                            xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                            viewBox="0 0 24 24" fill="none"
                                                            style="display:none;margin-left:8px;
animation:skynet-spin 0.8s linear infinite;">
                                                          <circle cx="12" cy="12" r="10"
                                                                  stroke="currentColor" stroke-width="3"
                                                                  stroke-dasharray="31.4" stroke-dashoffset="10"/>
                                                      </svg>
                                                  </button>
                                                  <button class="skynet-email-cancel-btn"
                                                          type="button"
                                                          onClick={() => skynetToggleEmailForm(Event)}
                                                          >
                                                      Cancel
                                                  </button>
                                              </div>

                                          </div>
                                      </div>
                                  </div>
                                    </div>
                                    <div className="scans" id="my_scan_sections">
                                      <p className="title">My Scans</p>
                                      <section
                                        className="status"
                                        style={{
                                          backgroundImage:
                                            "url('https://sanity.skynettechnologies.us/assets/images/sitemap-bg.png')",
                                          backgroundRepeat: 'no-repeat',
                                          backgroundPosition: 'center',
                                          backgroundSize: 'cover',
                                        }}
                                      >
                                        <div className="page-background" />
                                        <div className="status-card">
                                          <span className="status-title">Sitemap</span>
                                          <span
                                            className={`status-value ${
                                              data.is_expired
                                                ? 'status-paused'
                                                : data.url_scan_status < 2
                                                  ? 'status-progress'
                                                  : ''
                                            }`}
                                          >
                                            {data.is_expired ? (
                                              <>Scanning Paused</>
                                            ) : data.url_scan_status < 2 ? (
                                              <>Generating Sitemap</>
                                            ) : data.url_scan_status === 2 ? (
                                              <a
                                                style={{color: 'black', fontWeight: 700}}
                                                href={data.dashboard_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <span style={{fontSize: '40px'}}>
                                                  {data.total_pages}
                                                </span>{' '}
                                                Pages
                                              </a>
                                            ) : null}
                                            <span
                                              style={{
                                                fontSize: '40px',
                                              }}
                                            ></span>
                                          </span>
                                        </div>
                                        <div className="status-card">
                                          <span className="status-title">Scan Score</span>

                                          {data.is_expired ? (
                                            // Case 1: Expired
                                            <span className="status-value status-inactive">
                                              N/A
                                            </span>
                                          ) : (data.scan_violation_total ?? 0) === 0 ? (
                                            // Case 2: No violations found
                                            <span className="status-value status-inactive">
                                              N/A
                                            </span>
                                          ) : (
                                            // Case 3: Show scan score
                                            <span
                                              className="status-value status-progress"
                                              style={{cursor: 'pointer'}}
                                              onClick={() => showDetails()}
                                            >
                                              {data.success_percentage ?? 0}%
                                              <div className="progress-bar">
                                                <div
                                                  className="progress-fill"
                                                  style={{
                                                    width: `${data.success_percentage ?? 0}%`,
                                                  }}
                                                ></div>
                                              </div>
                                              <div className="violations">
                                                Violations:{' '}
                                                <span
                                                  className="status-value"
                                                  style={{fontSize: '15px'}}
                                                >
                                                  {data.total_fail_sum ?? 0}
                                                </span>
                                              </div>
                                            </span>
                                          )}
                                        </div>
                                        <div className="status-card">
                                          <span className="status-title">Last Scanned</span>
                                          {(data.url_scan_status ?? 0) < 2 ? (
                                            // Case 1: Not started (URL scan not initiated)
                                            <span className="status-value status-inactive">
                                              <img src={notShared} alt="" title="Not Started" />
                                              Not Started
                                            </span>
                                          ) : (data.scan_status ?? 0) === 0 ? (
                                            // Case 2: Not started (Scan status = 0)
                                            <span className="status-value status-inactive">
                                              <img src={notShared} alt="" title="Not Started" />
                                              Not Started
                                            </span>
                                          ) : (data.scan_status ?? 0) === 1 ||
                                            (data.scan_status ?? 0) === 2 ? (
                                            // Case 3: Scanning in progress
                                            <span className="status-value status-inactive">
                                              <img
                                                src={notShared}
                                                alt=""
                                                title="Scanning in process"
                                              />
                                              Scanning
                                              <br />
                                              {data.total_scan_pages ?? 0}/
                                              {data.total_selected_pages ?? 0}
                                            </span>
                                          ) : (data.scan_status ?? 0) === 3 ? (
                                            // Case 4: Scan completed
                                            <span className="status-value status-active">
                                              {data.total_scan_pages ?? 0} Pages
                                              <br />
                                              {data.last_scan
                                                ? new Date(data.last_scan).toLocaleDateString(
                                                    'en-US',
                                                    {
                                                      month: 'long',
                                                      day: 'numeric',
                                                      year: 'numeric',
                                                    },
                                                  )
                                                : ''}
                                            </span>
                                          ) : null}
                                        </div>
                                      </section>
                                      <div
                                        style={{
                                          border: 'none',
                                          borderTop: '1px solid #EAD5FF',
                                          marginBottom: '30px',
                                          marginTop: '0',
                                        }}
                                      />
                                      <section
                                        className="plan"
                                        style={{
                                          backgroundImage:
                                            "url('https://sanity.skynettechnologies.us/assets/images/sitemap-bg.png')",
                                          backgroundRepeat: 'no-repeat',
                                          backgroundPosition: 'center',
                                          backgroundSize: 'cover',
                                        }}
                                      >
                                        <div className="page-background" />
                                        <div className="plan-info">
                                          <div className="plans-left">
                                            <span className="plan-type free">
                                              <div className="icon-circle">
                                                <img src={round} alt="" height="20" width="20" />
                                              </div>

                                              {/* --- Plan Name / Expiry Status --- */}
                                              <span>
                                                {(() => {
                                                  const isExpired =
                                                    data.end_date &&
                                                    new Date(data.end_date)
                                                      .toISOString()
                                                      .split('T')[0] <
                                                      new Date().toISOString().split('T')[0]

                                                  if (isExpired) {
                                                    return (
                                                      <span
                                                        style={{color: '#9F0000', fontWeight: 700}}
                                                      >
                                                        Your Plan has Expired
                                                      </span>
                                                    )
                                                  } else if (data.is_trial_period === 1) {
                                                    return <>Free Plan</>
                                                  } else {
                                                    return <>{data.package_name} Plan</>
                                                  }
                                                })()}
                                              </span>

                                              {/* --- Plan Description --- */}
                                              <span className="plan-desc">
                                                <ul>
                                                  {(() => {
                                                    const isExpired =
                                                      data.end_date &&
                                                      new Date(data.end_date)
                                                        .toISOString()
                                                        .split('T')[0] <
                                                        new Date().toISOString().split('T')[0]

                                                    if (!isExpired) {
                                                      return (
                                                        <li>Scan up to {data.page_views} Pages</li>
                                                      )
                                                    }
                                                    return null
                                                  })()}
                                                </ul>
                                              </span>

                                              <span className="plan-badge">Current Plan</span>
                                            </span>
                                          </div>

                                          {/* --- Right Side --- */}
                                          <div className="plans-right">
                                            <span className="plan-renewal">
                                              {isExpired ? 'Expired on: ' : 'Renews on: '}
                                              <strong>
                                                {data.end_date
                                                  ? new Date(data.end_date).toLocaleDateString(
                                                      'en-US',
                                                      {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                      },
                                                    )
                                                  : ''}
                                              </strong>
                                            </span>

                                            {(() => {
                                              const isExpired =
                                                data.end_date &&
                                                new Date(data.end_date)
                                                  .toISOString()
                                                  .split('T')[0] <
                                                  new Date().toISOString().split('T')[0]

                                              return (
                                                <button
                                                  className="cancel-btn"
                                                  style={
                                                    isExpired
                                                      ? {backgroundColor: '#420083', color: '#fff'}
                                                      : undefined
                                                  }
                                                  onClick={() =>
                                                    window.open(data.dashboard_link, '_blank')
                                                  }
                                                >
                                                  {isExpired ? 'Renew Plan' : 'Cancel Subscription'}
                                                </button>
                                              )
                                            })()}
                                          </div>
                                        </div>
                                      </section>
                                      <section
                                        className="pricing"
                                        style={{
                                          backgroundImage:
                                            "url('https://sanity.skynettechnologies.us/assets/images/sitemap-bg.png')",
                                          backgroundRepeat: 'no-repeat',
                                          backgroundPosition: 'center',
                                          backgroundSize: 'cover',
                                        }}
                                      >
                                        <div className="page-background" />
                                        <div className="billing-toggle">
                                          <span className="label active" id="monthly-label">
                                            Pay Monthly
                                          </span>
                                          <label className="switch">
                                            {/* <input type="checkbox" id="billing-toggle" /> */}
                                            <input
                                              type="checkbox"
                                              id="billing-toggle"
                                              checked={isAnnual}
                                              onChange={handleToggle}
                                            />
                                            <span className="slider"></span>
                                          </label>
                                          <span className="label" id="annual-label">
                                            Pay Annually
                                          </span>
                                          <span className="save">Save 20%</span>
                                        </div>

                                        {!isAnnual && (
                                          <div id="monthlyclass" className="monthlyclass">
                                            <div className="pricing-tiers">
                                              {plans && plans.length > 0 ? (
                                                plans.map((plan, index) => {
                                                  const isExpired =
                                                    data.end_date &&
                                                    new Date(data.end_date)
                                                      .toISOString()
                                                      .split('T')[0] <
                                                      new Date().toISOString().split('T')[0]
                                                  const isSamePrice =
                                                    data.final_price === plan.monthly_price
                                                  const action = isExpired
                                                    ? 'upgrade'
                                                    : isSamePrice
                                                      ? 'cancel'
                                                      : 'upgrade'
                                                  return (
                                                    <div
                                                      key={plan.id}
                                                      className="tier"
                                                      data-plan-id={plan.id}
                                                      data-annual-price={plan.price}
                                                      data-monthly-price={plan.monthly_price}
                                                    >
                                                      <div className="pricing-top">
                                                        <div className="pricing-header">
                                                          <div className="icon-circle">
                                                            {index === 0 && (
                                                              <img
                                                                src={diamond}
                                                                alt=""
                                                                height="20"
                                                                width="20"
                                                              />
                                                            )}
                                                            {index === 1 && (
                                                              <img
                                                                src={pentagon}
                                                                alt=""
                                                                height="20"
                                                                width="20"
                                                              />
                                                            )}
                                                            {index === 2 && (
                                                              <img
                                                                src={hexagon}
                                                                alt=""
                                                                height="20"
                                                                width="20"
                                                              />
                                                            )}
                                                            {index === 3 && (
                                                              <img
                                                                src={hexagon}
                                                                alt=""
                                                                height="20"
                                                                width="20"
                                                              />
                                                            )}
                                                          </div>
                                                        </div>

                                                        <div className="pricing-info">
                                                          <h3 className="tier-title">
                                                            {plan.name}
                                                          </h3>
                                                          <p className="tier-pages">
                                                            {plan.page_views} Pages
                                                          </p>
                                                        </div>
                                                      </div>

                                                      <hr className="pricing-divider" />

                                                      <div className="pricing-body">
                                                        <p className="old-price">
                                                          ${plan.strick_monthly_price}
                                                        </p>
                                                        <p className="new-price">
                                                          ${plan.monthly_price}
                                                          <span className="per-year">/Monthly</span>
                                                        </p>
                                                      </div>

                                                      <button
                                                        className={`upgrade-btn ${
                                                          !isExpired && isSamePrice
                                                            ? 'cancel-btnn'
                                                            : ''
                                                        }`}
                                                        data-action={action}
                                                        onClick={() =>
                                                          handleUpgradeClick(plan.id, action, 'M')
                                                        }
                                                      >
                                                        {isExpired
                                                          ? 'Upgrade'
                                                          : isSamePrice
                                                            ? 'Cancel'
                                                            : 'Upgrade'}
                                                      </button>
                                                    </div>
                                                  )
                                                })
                                              ) : (
                                                <p>No plans available.</p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        {isAnnual && (
                                          <div id="annualclass" className="annualclass">
                                            <div className="pricing-tiers">
                                              {plans && plans.length > 0 ? (
                                                plans.map((plan, index) => {
                                                  const isExpired =
                                                    data.end_date &&
                                                    new Date(data.end_date)
                                                      .toISOString()
                                                      .split('T')[0] <
                                                      new Date().toISOString().split('T')[0]
                                                  const isSamePrice =
                                                    data.final_price === plan.strick_price
                                                  const action = isExpired
                                                    ? 'upgrade'
                                                    : isSamePrice
                                                      ? 'cancel'
                                                      : 'upgrade'
                                                  return (
                                                    <div
                                                      key={plan.id}
                                                      className="tier"
                                                      data-plan-id={plan.id}
                                                      data-annual-price={plan.strick_price}
                                                      data-monthly-price={plan.strick_monthly_price}
                                                    >
                                                      <div className="pricing-top">
                                                        <div className="pricing-header">
                                                          <div className="icon-circle">
                                                            {index === 0 && (
                                                              <img
                                                                src={diamond}
                                                                alt=""
                                                                height="20"
                                                                width="20"
                                                              />
                                                            )}
                                                            {index === 1 && (
                                                              <img
                                                                src={pentagon}
                                                                alt=""
                                                                height="20"
                                                                width="20"
                                                              />
                                                            )}
                                                            {index === 2 && (
                                                              <img
                                                                src={hexagon}
                                                                alt=""
                                                                height="20"
                                                                width="20"
                                                              />
                                                            )}
                                                            {index === 3 && (
                                                              <img
                                                                src={hexagon}
                                                                alt=""
                                                                height="20"
                                                                width="20"
                                                              />
                                                            )}
                                                          </div>
                                                        </div>
                                                        <div className="pricing-info">
                                                          <h3 className="tier-title">
                                                            {plan.name}
                                                          </h3>
                                                          <p className="tier-pages">
                                                            {plan.page_views} Pages
                                                          </p>
                                                        </div>
                                                      </div>
                                                      <hr className="pricing-divider" />
                                                      <div className="pricing-body">
                                                        <p className="old-price">
                                                          ${plan.strick_price}
                                                        </p>
                                                        <p className="new-price">
                                                          ${plan.price}
                                                          <span className="per-year">/Year</span>
                                                        </p>
                                                      </div>
                                                      <button
                                                        className={`upgrade-btn ${
                                                          !isExpired && isSamePrice
                                                            ? 'cancel-btnn'
                                                            : ''
                                                        }`}
                                                        data-action={action}
                                                        onClick={() =>
                                                          handleUpgradeClick(plan.id, action, 'Y')
                                                        }
                                                      >
                                                        {isExpired
                                                          ? 'Upgrade'
                                                          : isSamePrice
                                                            ? 'Cancel'
                                                            : 'Upgrade'}
                                                      </button>
                                                    </div>
                                                  )
                                                })
                                              ) : (
                                                <p>No plans available.</p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        <p className="pricing-contact">
                                          Are you looking for a custom plan or Enterprise plan?
                                          Contact us{' '}
                                          <a href="mailto:hello@skynettechnologies.com">
                                            hello@skynettechnologies.com
                                          </a>
                                        </p>
                                      </section>
                                      <div
                                        style={{
                                          border: 'none',
                                          borderTop: '1px solid #EAD5FF',
                                          marginBottom: '30px',
                                          marginTop: '0',
                                        }}
                                      />
                                      <section className="help">
                                        <p className="help-text">
                                          <strong>
                                            Facing any issues with SkynetAccessibility Scanner?
                                          </strong>
                                          Report a problem, we will get back to you very soon!
                                        </p>
                                        <a
                                          className="help-btn"
                                          href="https://www.skynettechnologies.com/report-accessibility-problem"
                                        >
                                          Report a problem
                                        </a>
                                      </section>
                                    </div>
                                  </div>
                                </div>
                              </article>
                            </div>
                          </div>
                        </section>
                      </main>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="section2" style={{display: 'none'}}>
          <div className="dialog-off-canvas-main-canvas" data-off-canvas-main-canvas>
            <div id="page-wrapper">
              <div id="page">
                <div id="main-wrapper" className="layout-main-wrapper clearfix">
                  <div id="main" className="container">
                    <div className="row row-offcanvas row-offcanvas-left clearfix">
                      <main className="main-content col" id="content" role="main">
                        <section className="section">
                          <div id="main-content" tabIndex={-1}></div>
                          <div
                            id="block-skynettechnologies-content"
                            className="block block-system block-system-main-block"
                          >
                            <div className="content">
                              <article
                                data-history-node-id="529"
                                className="node node--type-page node--view-mode-full clearfix"
                              >
                                <div className="node__content clearfix">
                                  <div className="scanning-monitoring-app">
                                    <div className="accessibility-report">
                                      {/* Report Date */}
                                      <div className="report-date">
                                        <label htmlFor="report-date">Report Date:</label>
                                        <select id="report-date" defaultValue={lastScanDate}>
                                          <option>{lastScanDate}</option>
                                        </select>
                                      </div>

                                      {/* Top Section */}
                                      <section className="top-section">
                                        {/* Accessibility Score */}
                                        <div className="card score-card">
                                          <h3>Accessibility Score</h3>
                                          <div className="accessibility-score">
                                            <div className="score-value">{successPercentage}%</div>
                                            <span className={`status-text ${statusClass}`}>
                                              {statusText}
                                            </span>
                                          </div>
                                          <div className="progress-bar">
                                            <div
                                              className="progress-fill"
                                              style={{width: `${successPercentage}%`}}
                                            ></div>
                                          </div>
                                          <p className="note">
                                            Automated Accessibility score has limitations. We
                                            recommend Manual Accessibility Audit.
                                          </p>
                                        </div>

                                        {/* Web Pages Scanned */}
                                        <div className="card pages-card">
                                          <h3>Web Pages Scanned</h3>
                                          <div className="pages-value">{totalScanPages}</div>
                                          <div className="progress-bar">
                                            <div
                                              className="progress-fill"
                                              style={{width: `${progressWidth}%`}}
                                            ></div>
                                          </div>
                                          <p className="note">
                                            {totalScanPages} pages scanned out of {totalPages}
                                          </p>
                                        </div>
                                      </section>

                                      {/* WCAG Section */}
                                      <section className="wcag-section">
                                        <div className="wcag-header">
                                          <h3>WCAG 2.1/2.2</h3>
                                          <button onClick={openViolationLink} className="view-btn">
                                            View all Violations{' '}
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="6"
                                              height="10"
                                              viewBox="0 0 6 10"
                                              fill="none"
                                            >
                                              <path
                                                d="M6 5.00002C6 5.17924 5.92797 5.35843 5.78422 5.49507L1.25832 9.79486C0.970413 10.0684 0.503627 10.0684 0.21584 9.79486C-0.0719468 9.52145 -0.0719468 9.07807 0.21584 8.80452L4.22061 5.00002L0.21598 1.19549C-0.0718073 0.921968 -0.0718073 0.478632 0.21598 0.205242C0.503767 -0.0684128 0.970553 -0.0684128 1.25846 0.205242L5.78436 4.50496C5.92814 4.64166 6 4.82086 6 5.00002Z"
                                                fill="white"
                                              />
                                            </svg>
                                          </button>
                                        </div>

                                        {/* Checks Grid */}
                                        <div className="checks-grid">
                                          <div className="check-card failed">
                                            <span className="check-value">
                                              {data?.scan_details?.with_remediation?.total_fail ??
                                                0}
                                            </span>
                                            <span className="check-label">Failed Checks</span>
                                          </div>

                                          <div className="check-card passed">
                                            <span className="check-value">
                                              {data?.scan_details?.with_remediation
                                                ?.total_success ?? 0}
                                            </span>
                                            <span className="check-label">Passed Checks</span>
                                          </div>

                                          <div className="check-card na">
                                            <span className="check-value">
                                              {data?.scan_details?.with_remediation?.severity_counts
                                                ?.Not_Applicable ?? 0}
                                            </span>
                                            <span className="check-label">N/A Checks</span>
                                          </div>
                                        </div>

                                        <hr className="divider" />

                                        {/* Violations Grid */}
                                        <div className="violations-grid">
                                          {['A', 'AA', 'AAA'].map((level) => (
                                            <div className="violation-card" key={level}>
                                              <span className="violation-title">Level {level}</span>
                                              <span className="violation-count">
                                                <span>
                                                  {data?.scan_details?.with_remediation
                                                    ?.criteria_counts?.[level] ?? 0}
                                                </span>{' '}
                                                violations
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </section>

                                      <br />
                                      <button className="back-btn" onClick={() => goBack()}>
                                        Back
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </article>
                            </div>
                          </div>
                        </section>
                      </main>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script
          crossOrigin="anonymous"
          integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
          src="https://code.jquery.com/jquery-3.7.1.min.js"
        />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" />
      </div>{' '}
    </>
  )
}

export default HomePage
