//某果农有一车苹果，第一天卖掉三分之二后自己吃了两个苹果，
//第二天卖掉了剩下的三分之二后又吃了两个苹果，第三天到第七天都如此，
//到第八天一看只剩下了五个苹果。
//请编程计算此车共装有多少个苹果。
#include"stdio.h"
int main()
{
    int apples = 5;
    for(int day = 7; day >= 1; day--)
    {
        apples = (apples + 2) * 3;
    }
    printf("此车共装有 %d 个苹果\n", apples);
    return 0;
}

