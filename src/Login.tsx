import React, {Component} from "react";
import {Form, Input, Button} from 'antd';
import './static/css/login/login.css'

const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 16,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 4,
        span: 16,
    },
};

interface IState {
    width: number
    height: number
}

export default class Login extends Component<any, IState> {
    constructor(props: any, context: any) {
        super(props, context);
        let height = window.document.body.clientHeight
        let width = window.document.body.clientWidth
        this.state = {
            width: width,
            height: height
        }
        window.addEventListener('resize', this.handleResize.bind(this)) //监听窗口大小改变
    }

    handleResize = () => {
        let height = window.document.body.clientHeight
        let width = window.document.body.clientWidth
        this.setState({
            width: width,
            height: height
        })
    }
    onFinish = (values: any) => {
        console.log('Success:', values);
    };

    onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    render() {
        return (
            <div
                className='login'
                style={{
                    width: this.state.width + 'px',
                    height: this.state.height + 'px'
                }}
            >
                <Form
                    id='login-form'
                    className='login-form'
                    {...layout}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                >
                    <Form.Item
                        label="用户名"
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: '请输入用户名',
                            },
                        ]}
                    >
                        <Input placeholder='请输入用户名'/>
                    </Form.Item>

                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: '请输入密码',
                            },
                        ]}
                    >
                        <Input.Password placeholder='请输入密码'/>
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}
