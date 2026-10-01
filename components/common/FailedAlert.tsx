import { Alert } from "antd"

const AlertMessage = ({ errorMessage }: { errorMessage: string | null }) => {


    return (
        <Alert title={errorMessage} type="error" closable />
    )
}

export default AlertMessage