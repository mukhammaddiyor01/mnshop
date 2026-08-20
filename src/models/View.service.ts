import ViewModel from "../schema/View.model";
import { ViewInput } from "../libs/types/view";

class ViewService {
  private readonly viewModel = ViewModel;

  public async createIfMissing(input: ViewInput): Promise<boolean> {
    const existingView = await this.viewModel
      .findOne({
        buyerId: input.buyerId,
        viewRefId: input.viewRefId,
        viewGroup: input.viewGroup,
      })
      .exec();

    if (existingView) return false;

    try {
      await this.viewModel.create(input);
      return true;
    } catch (err: unknown) {
      if ((err as { code?: number }).code === 11000) return false;
      throw err;
    }
  }
}

export default ViewService;
