import 'bootstrap/dist/css/bootstrap.min.css';
import Btn from './button.jsx'


const Form = () => {
    return (
        <form action="submit" className='cointainer m-3  border border-2 border-dark bg-light'>
            <div className="m-3">
            <label htmlFor="">Name:   </label>
            <input type="text" name="name" id="name" /></div>
            <div className='m-3'><label htmlFor="">Email:  </label>
            <input type="text" name="email" id="email" /></div>
            <Btn />
        </form>
    );
}
export default Form;