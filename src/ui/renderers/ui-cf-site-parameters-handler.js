// class UiCfSiteParametersHandler extends UiSiteParameterRenderer {
//     constructor(values) {
//         this.values = {
//             rollsPerVisit: 1,
//             tryGetCodes: true,
//             autologin: false,
//             credentialsMode: '2',
//             email: null,
//             password: null,
//         }
//         Object.assign(this.values, values);
//     }

//     static {
//         UiSiteParameterRenderer.registerHandler('CFSite', this);
//     }

//     render() {
//         fieldValues = this.values;
//         // Expected fieldValues: maybe an id or data-prop
//         // { autologin: { value: true,  } }
//         let disableModeSelect = (fieldValues['autologin'].value !== true);
//         let disableEmailAndPassword = (fieldValues['autologin'].value !== true || fieldValues['credentialsMode'].value == '2');
//         let html = '';
//         html += '         <div class="card m-1 collapsed-card"><div class="card-header">CryptosFaucets<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
//         html += '           <div class="card-body px-4" style="display: none;">';
//         html += '          <div><label class="switch"><input type="checkbox" data-prop="cf.tryGetCodes" ><span class="slider round"></span></label> Auto update promo codes </div>';
//         html += '          <div><label class="switch"><input type="checkbox" data-prop="cf.rollOnce" ><span class="slider round"></span></label> Roll once per round </div>';
//         html += `          <div><label class="switch"><input type="checkbox" data-prop="cf.autologin"><span class="slider round"></span></label> Autologin when necessary</div>`;
//         html += `           <select class="form-control" data-prop="cf.credentials.mode" ${disableModeSelect ? 'disabled' : ''}>`;
//         html += '            <option value="1">Use Email and Password</option><option value="2">Filled by 3rd party software/extension</option>';
//         html += '           </select>';
//         html += '           <label class="control-label">E-Mail</label>';
//         html += `           <input maxlength="200" type="text" data-prop="cf.credentials.email" required="required" ${disableEmailAndPassword ? 'disabled=' : ''} class="form-control" placeholder="Email address..."/>`;
//         html += '           <label class="control-label">Password</label>';
//         html += `           <input maxlength="200" type="password" data-prop="cf.credentials.password" required="required" ${disableEmailAndPassword ? 'disabled=' : ''} class="form-control" placeholder="Password..."/>`;
//         html += '           <label class="control-label">Hours to wait If IP is banned:</label>';
//         html += '           <select class="form-control" data-prop="cf.sleepHoursIfIpBan">';
//         html += '            <option value="0">Disabled</option><option value="2">2</option><option value="4">4</option><option value="8">8</option><option value="16">16</option><option value="24">24</option><option value="26">26</option>';
//         html += '           </select>';
//         html += '       </div></div>';
//     }

//     preRender() {

//     }

//     postRender() {
//         let elCredentialsAutologin = document.querySelector('[name="autologin"]');
//         let elCredentialsMode = document.querySelector('[name="credentialsMode"]');

//         elCredentialsAutologin.addEventListener('change', function (e) {
//             let form = e.target.closest('form');
//             form.querySelector('[name="credentialsMode"]').disabled = !e.target.checked;
//             form.querySelector('[name="email"]').disabled = !e.target.checked;
//             form.querySelector('[name="password"]').disabled = !e.target.checked;
//         });

//         elCredentialsMode.addEventListener('change', function (e) {
//             let form = e.target.closest('form');
//             form.querySelector('[name="email"]').disabled = (e.target.value == '2');
//             form.querySelector('[name="password"]').disabled = (e.target.value == '2');
//         });
//     }
// }

