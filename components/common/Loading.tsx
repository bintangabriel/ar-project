import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Loading = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-10 z-50 min-h-screen">
            <div className="max-w-screen-lg w-full flex justify-center">
                <Spin indicator={<LoadingOutlined spin />} size="large" />
            </div>
        </div>
    )
}

export default Loading