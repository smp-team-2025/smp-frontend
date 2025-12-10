import {BrowserRouter as Router, Routes, Route,Navigate} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminRegistrationsListPage from './pages/AdminRegistrationsListPage';
import AdminRegistrationDetailPage from './pages/AdminRegistrationDetailPage';

export default function App(){
    return(
        <Router>
            <Routes>
                <Route path='/' element={<Navigate to='/login' replace/>}/>

                {/*Route in the browser for Login*/}
                <Route path='/login' element={<LoginPage/>}/>

                {/*Route in the browser for Registration*/}
                <Route path='/registration' element={<RegistrationPage/>}/>

                {/*Admin Routes*/}
                <Route path='/admin/registrations' element={<AdminRegistrationsListPage/>}/>
                <Route path='/admin/registrations/:id' element={<AdminRegistrationDetailPage/>}/>

                {/*Optional */}
                <Route path='*' element={<h1>404 - Seite nicht gefunden</h1>}/>
                
           </Routes>
        </Router>
    )
}