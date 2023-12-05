import Header from './Header'
import Tasks from './Tasks'
import { AppProvider } from './AppContext';
import 'primereact/resources/themes/lara-light-cyan/theme.css'

function App() {
  return (
    <AppProvider>
      <Header />
      <Tasks />
    </AppProvider>
  );
}

export default App;
