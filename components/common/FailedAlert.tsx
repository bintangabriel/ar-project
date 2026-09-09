import { Alert } from "antd"

const AlertMessage = ({ errorMessage }: { errorMessage: string | null }) => {


    return (
        <Alert message={errorMessage} type="error" closable style={{ color: "red", margin: 5 }}/>
    )
}

export default AlertMessage