import * as React from 'react'
import { FormEvent } from 'react'
import * as _ from 'lodash'
import { Button, Form, Input, Select } from 'antd'
import { FormComponentProps } from 'antd/es/form'
import musicSubreddits from '../data/music-subreddits'

interface FormProps extends FormComponentProps {
  onPreview: () => Promise<void>,
  onSubmit: (values: PlaylistConfig) => Promise<CreatePlaylistResponse>
}

interface FormState {
  subredditSearch: string,
  subreddits: string[],
  invalidSubreddits: string[],
  previewLoading: boolean,
  submitLoading: boolean,
}

export class PlaylistForm extends React.Component<FormProps, FormState> {
  musicSubredditsUrl = 'https://www.reddit.com/r/Music/wiki/musicsubreddits'
  subredditsLink = <a href={this.musicSubredditsUrl} target="_blank">this page</a>

  constructor(props: FormProps) {
    super(props)

    this.state = {
      subredditSearch: '',
      subreddits: [],
      invalidSubreddits: [],
      previewLoading: false,
      submitLoading: false
    }

    this.filterSubreddits = _.debounce(this.filterSubreddits, 300)
  }

  private handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        this.setState({ submitLoading: true })
        const result = await this.props.onSubmit(values)
        this.setState({ submitLoading: false })
        if (!result.success) {
          this.setState({
            invalidSubreddits: _.intersection(result.invalidSubreddits!, values.subreddits)
          })

          // Hack: find all <li>'s which have titles set to invalid subreddits and change their bg color
          result.invalidSubreddits!.forEach(sub => {
            const node = document.querySelector<HTMLLIElement>(`[title="${sub}"]`)
            node && (node.style.backgroundColor = '#ca8909')
          })
        }
      }
    })
  }

  private readonly filterSubreddits = (value: string) => {
    this.setState({ subredditSearch: value })

    if (value === '/r/' || value === '') {
      this.setState({ subreddits: [] })
      return
    }

    let subreddits = musicSubreddits
    if (value.replace('/r/', '').length < 4) {
      subreddits = subreddits
        .filter(sub => sub.length === 7)
    }
    subreddits = subreddits
      .filter(sub => sub.toLowerCase().includes(value.toLowerCase()))

    const enteredSubreddit = value.startsWith('/r/') ? value : `/r/${value}`
    if (!subreddits.includes(enteredSubreddit)) {
      subreddits.unshift(enteredSubreddit)
    }
    this.setState({ subreddits })
  }

  private handleChange = (values: string[]) => {
    this.setState({
      subredditSearch: '',
      subreddits: [],
      invalidSubreddits: _.intersection(this.state.invalidSubreddits, values)
    })
  }

  private getSubredditsInputValidation = () => {
    if (this.state.invalidSubreddits.length !== 0) {
      return {
        validateStatus: 'warning' as 'warning',
        help: `Some of the subreddits you've entered do not exist`
      }
    }

    const subredditsErrors = this.props.form.getFieldError('subreddits')
    if (!subredditsErrors || subredditsErrors.length === 0) {
      return {}
    }

    return {
      validateStatus: 'error' as 'error',
      help: subredditsErrors[0]
    }
  }

  private onPreview = async () => {
    this.setState({ previewLoading: true })
    await this.props.onPreview()
    this.setState({ previewLoading: false })
  }

  public render() {
    const { getFieldDecorator } = this.props.form

    return (
      <Form onSubmit={this.handleSubmit} layout="vertical" hideRequiredMark={true}>
        <Form.Item label="Name">
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'A playlist needs a name!', whitespace: true }]
          })(
            <Input size="large" placeholder="e.g. Study Music"/>
          )}
          <span style={{ fontSize: 14 }}>
            Note: If this name matches an existing playlist you have, that playlist will be updated
          </span>
        </Form.Item>
        <Form.Item
          label="Subreddits"
          {...this.getSubredditsInputValidation()}
        >
          {getFieldDecorator('subreddits', {
            rules: [{ required: true, message: 'Please pick some subreddits', type: 'array' }]
          })(
            <Select
              mode="multiple"
              placeholder="e.g. /r/chillhop, /r/LofiHipHop, ..."
              size="large"
              notFoundContent={null}
              onSearch={this.filterSubreddits}
              onChange={this.handleChange}
            >
              {this.state.subreddits.map(sub =>
                <Select.Option key={sub} value={sub}>{sub}</Select.Option>
              )}
            </Select>
          )}
          <span style={{ fontSize: 14 }}>
            There are tons of subreddits where you can find music, and not all of them are
            in this auto-complete box! You can type into the auto-complete box above for some
            of the most common ones, or you could check out {this.subredditsLink} for a big list
          </span>
        </Form.Item>

        <h3>Options</h3>

        <div style={{ display: 'flex' }}>
          <Form.Item label="Update Interval" style={{ flex: 1, marginRight: 12 }}>
            {getFieldDecorator('updateInterval', { initialValue: 'weekly' })(
              <Select size="large">
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="weekly">Weekly</Select.Option>
              </Select>
            )}
            <span style={{ fontSize: 14 }}>
              How often do you want new songs added to this playlist?
            </span>
          </Form.Item>
          <Form.Item label="Max To Add" style={{ flex: 1, marginLeft: 12 }}>
            {getFieldDecorator('maxToAdd', { initialValue: 20 })(
              <Input type="number" size="large" placeholder="All"/>
            )}
            <span style={{ fontSize: 14 }}>
              You don't want your playlist to be flooded with more music than you can listen to
            </span>
          </Form.Item>
        </div>

        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
          {/*<Button type="ghost" size="large" style={{ marginRight: 12 }} onClick={this.onPreview}*/}
          {/*loading={this.state.previewLoading}>*/}
          {/*Preview*/}
          {/*</Button>*/}
          <Button type="primary" size="large" htmlType="submit" loading={this.state.submitLoading}>
            Create
          </Button>
        </div>
      </Form>
    )
  }
}
