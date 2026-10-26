import "../common/loader.css"

export default function Loader({ text }) {
    return(
        <div className="loader-container">
            <span className="loader"></span>
            <h5>{text}</h5>
            
        </div>
    )
}