import * as React from 'react'
import { FormEvent } from 'react'
import * as _ from 'lodash'
import { Button, Form, Input, Select, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/es/form'
import musicSubreddits from '../data/music-subreddits'
import styled from 'styled-components'

interface FormProps extends FormComponentProps {
  onPreview: (subreddits: string[], maxToAdd: number) => Promise<void>,
  onSubmit: (values: PlaylistConfig) => Promise<CreatePlaylistResponse>
}

interface FormState {
  subredditSearch: string,
  subreddits: string[],
  invalidSubreddits: string[],
  previewLoading: boolean,
  previewedSubreddits: string[],
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
      previewedSubreddits: [],
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
    const fields: any = this.props.form.getFieldsValue(['subreddits', 'maxToAdd'])
    await this.props.onPreview(fields.subreddits, fields.maxToAdd)
    this.setState({ previewedSubreddits: fields.subreddits, previewLoading: false })
  }

  private renderPreviewButton = () => {
    const subreddits = this.props.form.getFieldValue('subreddits')

    const btnProps = {
      type: 'ghost' as 'ghost',
      size: 'large' as 'large',
      style: { marginRight: 12 },
      onClick: this.onPreview,
      loading: this.state.previewLoading
    }

    if (!subreddits) {
      return (
        <Tooltip title="You can't see a preview until you pick some subreddits">
          <Button {...btnProps} disabled={true}>Preview</Button>
        </Tooltip>
      )
    }

    if (_.isEqual(subreddits, this.state.previewedSubreddits)) {
      return (
        <Tooltip title="Add or remove some subreddits to see a different preview">
          <Button {...btnProps} disabled={true}>Preview</Button>
        </Tooltip>
      )
    }

    return (
      <Tooltip title="See what types of songs will be added to this playlist">
        <Button {...btnProps}>Preview</Button>
      </Tooltip>
    )
  }

  public render() {
    const { getFieldDecorator } = this.props.form

    const subreddits = this.props.form.getFieldValue('subreddits')
    const createDisabled = !subreddits || !this.props.form.getFieldValue('name')

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

        <HalfWidthFormItemContainer>
          <HalfWidthFormItem label="Update Interval">
            {getFieldDecorator('updateInterval', { initialValue: 'weekly' })(
              <Select size="large">
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="weekly">Weekly</Select.Option>
              </Select>
            )}
            <span style={{ fontSize: 14 }}>
              How often do you want new songs added to this playlist?
            </span>
          </HalfWidthFormItem>
          <HalfWidthFormItem label="Max To Add">
            {getFieldDecorator('maxToAdd', { initialValue: 20 })(
              <Input type="number" size="large" placeholder="All"/>
            )}
            <span style={{ fontSize: 14 }}>
              You don't want your playlist to be flooded with more music than you can listen to
            </span>
          </HalfWidthFormItem>
        </HalfWidthFormItemContainer>

        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', marginTop: 24 }}>
          {this.renderPreviewButton()}
          <Tooltip
            title={createDisabled
              ? `You can't save this playlist until you pick a name and some subreddits`
              : ''}
          >
            <Button
              type="primary" size="large" htmlType="submit"
              loading={this.state.submitLoading}
              disabled={createDisabled}
            >
              Create
            </Button>
          </Tooltip>
        </div>
      </Form>
    )
  }
}

const HalfWidthFormItem = styled(Form.Item)`
  flex: 1;
  
  &:not(:last-child) {
    margin-right: 12px;
  }
  
  &:not(:first-child) {
    margin-left: 12px;
  }
  
  @media screen and (max-width: 800px) {
    margin: 0 !important;
  }
`

const HalfWidthFormItemContainer = styled.div`
  display: flex;
  
  @media screen and (max-width: 800px) {
    flex-direction: column;
  }
`
